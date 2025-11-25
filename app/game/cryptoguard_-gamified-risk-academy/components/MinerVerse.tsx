import React, { useRef, useEffect, useState } from 'react';
import { LEVELS } from '../constants';
import { Question, QuestionType } from '../types';
import Button from './ui/Button';
import { Zap, Brain, DollarSign, AlertTriangle, ShieldAlert, Crosshair } from 'lucide-react';

interface MinerVerseProps {
  levelId: number;
  targetScore: number;
  onExit: (success: boolean, score: number) => void;
}

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 4;
const BASE_ENEMY_SPEED = 1.2;
const PROJECTILE_SPEED = 8;
const MINING_RATE = 15;
const MINING_RANGE = 60;
const AMMO_MAX = 5;

// Types
type Entity = { x: number; y: number; width: number; height: number };
type Player = Entity & { angle: number; ammo: number; score: number };
type Enemy = Entity & { id: number; hp: number; speed: number };
type Projectile = Entity & { vx: number; vy: number; id: number };
type Node = Entity & { id: number; value: number; depleted: boolean };

const MinerVerse: React.FC<MinerVerseProps> = ({ levelId, targetScore, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'QUIZ' | 'SHOP' | 'GAME_OVER' | 'VICTORY'>('START');
  const [activeQuiz, setActiveQuiz] = useState<Question | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<boolean | null>(null);
  const [riskLevel, setRiskLevel] = useState(1); // Difficulty Multiplier
  
  // Mutable Game State
  const player = useRef<Player>({ x: 400, y: 300, width: 32, height: 32, angle: 0, ammo: AMMO_MAX, score: 0 });
  const enemies = useRef<Enemy[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const nodes = useRef<Node[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const gameTime = useRef(0);
  const animationFrameId = useRef<number>(0);

  // --- INITIALIZATION ---
  const initGame = () => {
    player.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, width: 32, height: 32, angle: 0, ammo: AMMO_MAX, score: 0 };
    enemies.current = [];
    projectiles.current = [];
    setRiskLevel(1);
    
    // Generate Random Gold Nodes
    nodes.current = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: Math.random() * (CANVAS_WIDTH - 60) + 30,
      y: Math.random() * (CANVAS_HEIGHT - 60) + 30,
      width: 40,
      height: 40,
      value: 800, 
      depleted: false
    }));

    gameTime.current = 0;
    setGameState('PLAYING');
  };

  // --- GAME LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      if (gameState !== 'PLAYING') return;

      gameTime.current++;

      // Win Condition
      if (player.current.score >= targetScore) {
          setGameState('VICTORY');
          return;
      }

      // 1. Player Movement
      if (keys.current['ArrowUp'] || keys.current['w']) player.current.y = Math.max(0, player.current.y - PLAYER_SPEED);
      if (keys.current['ArrowDown'] || keys.current['s']) player.current.y = Math.min(CANVAS_HEIGHT - 32, player.current.y + PLAYER_SPEED);
      if (keys.current['ArrowLeft'] || keys.current['a']) player.current.x = Math.max(0, player.current.x - PLAYER_SPEED);
      if (keys.current['ArrowRight'] || keys.current['d']) player.current.x = Math.min(CANVAS_WIDTH - 32, player.current.x + PLAYER_SPEED);

      // 2. Mining Logic
      let isMining = false;
      nodes.current.forEach(node => {
        if (node.depleted) return;
        const dist = Math.hypot((player.current.x + 16) - (node.x + 20), (player.current.y + 16) - (node.y + 20));
        if (dist < MINING_RANGE) {
           isMining = true;
           node.value -= MINING_RATE;
           player.current.score += MINING_RATE;
           if (node.value <= 0) {
             node.depleted = true;
             // Spawn new node elsewhere
             setTimeout(() => {
                node.x = Math.random() * (CANVAS_WIDTH - 60) + 30;
                node.y = Math.random() * (CANVAS_HEIGHT - 60) + 30;
                node.value = 800;
                node.depleted = false;
             }, 4000);
           }
        }
      });

      // 3. Enemy Spawning based on Risk Level
      const spawnRate = Math.max(30, 120 - (riskLevel * 10)); // Higher risk = faster spawn
      if (gameTime.current % spawnRate === 0) { 
        const side = Math.floor(Math.random() * 4);
        let ex = 0, ey = 0;
        if (side === 0) { ex = Math.random() * CANVAS_WIDTH; ey = -30; } // Top
        if (side === 1) { ex = CANVAS_WIDTH + 30; ey = Math.random() * CANVAS_HEIGHT; } // Right
        if (side === 2) { ex = Math.random() * CANVAS_WIDTH; ey = CANVAS_HEIGHT + 30; } // Bottom
        if (side === 3) { ex = -30; ey = Math.random() * CANVAS_HEIGHT; } // Left
        
        // Enemy speed scales with Risk Level
        const currentEnemySpeed = BASE_ENEMY_SPEED * riskLevel;
        enemies.current.push({ x: ex, y: ey, width: 32, height: 32, id: Date.now() + Math.random(), hp: 1, speed: currentEnemySpeed });
      }

      // 4. Enemy Logic (Chase Player)
      enemies.current.forEach(enemy => {
        const angle = Math.atan2(player.current.y - enemy.y, player.current.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        // Collision with Player
        const dist = Math.hypot(player.current.x - enemy.x, player.current.y - enemy.y);
        if (dist < 20) {
           setGameState('GAME_OVER');
        }
      });

      // 5. Projectile Logic
      projectiles.current.forEach((proj, pIdx) => {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Bounds Check
        if (proj.x < 0 || proj.x > CANVAS_WIDTH || proj.y < 0 || proj.y > CANVAS_HEIGHT) {
           projectiles.current.splice(pIdx, 1);
           return;
        }

        // Enemy Hit Check
        enemies.current.forEach((enemy, eIdx) => {
           const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
           if (dist < 25) {
             enemies.current.splice(eIdx, 1);
             projectiles.current.splice(pIdx, 1);
           }
        });
      });

      // 6. Shop Trigger (Investment)
      if (gameTime.current > 0 && gameTime.current % 900 === 0) { // Every 15 seconds
          setGameState('SHOP');
      }

      draw(ctx, isMining);
      animationFrameId.current = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D, isMining: boolean) => {
      // Clear
      ctx.fillStyle = '#050505'; 
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Risk Level Background Tint
      if (riskLevel > 1) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.05 * (riskLevel - 1)})`; // Red tint increases with risk
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Grid
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke(); }
      for (let i = 0; i < CANVAS_HEIGHT; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke(); }

      // Nodes
      nodes.current.forEach(node => {
        if (node.depleted) return;
        ctx.fillStyle = '#facc15'; 
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.fillRect(node.x, node.y, node.width, node.height);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'black';
        ctx.font = '10px monospace';
        ctx.fillText('BTC', node.x + 8, node.y + 24);
      });

      // Player
      ctx.save();
      ctx.translate(player.current.x + 16, player.current.y + 16);
      if (isMining) {
         ctx.beginPath();
         ctx.strokeStyle = '#facc15';
         ctx.lineWidth = 2;
         ctx.moveTo(0, 0);
         const target = nodes.current.find(n => !n.depleted && Math.hypot(player.current.x - n.x, player.current.y - n.y) < MINING_RANGE);
         if (target) {
            ctx.lineTo(target.x - player.current.x + 4, target.y - player.current.y + 4);
            ctx.stroke();
         }
      }
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-16, -16, 32, 32);
      ctx.restore();

      // Enemies
      enemies.current.forEach(enemy => {
         ctx.fillStyle = '#ef4444'; 
         ctx.beginPath();
         ctx.arc(enemy.x + 16, enemy.y + 16, 16, 0, Math.PI * 2);
         ctx.fill();
         ctx.fillStyle = 'white';
         ctx.font = '12px monospace';
         ctx.fillText('SCAM', enemy.x + 2, enemy.y + 20);
      });

      // Projectiles
      ctx.fillStyle = '#00ffff'; 
      projectiles.current.forEach(proj => {
         ctx.fillRect(proj.x, proj.y, 8, 8);
      });

      // HUD
      ctx.fillStyle = 'white';
      ctx.font = '24px "VT323", monospace';
      ctx.fillText(`BTC: ${player.current.score} / ${targetScore}`, 20, 30);
      
      // Ammo
      ctx.fillText(`LOGIC:`, 20, 60);
      for(let i=0; i<AMMO_MAX; i++) {
         ctx.fillStyle = i < player.current.ammo ? '#00ffff' : '#374151';
         ctx.fillRect(80 + (i * 20), 42, 16, 16);
      }

      // Risk HUD
      ctx.fillStyle = riskLevel > 1 ? '#ef4444' : '#10b981';
      ctx.fillText(`RISK LEVEL: ${riskLevel.toFixed(1)}x`, CANVAS_WIDTH - 180, 30);
    };

    if (gameState === 'PLAYING') {
       update();
    }

    return () => {
       cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, riskLevel]);

  // --- CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      
      if (e.code === 'Space' && gameState === 'PLAYING') {
         if (player.current.ammo > 0) {
            player.current.ammo--;
            let target = enemies.current[0];
            let angle = 0;
            if (target) {
               angle = Math.atan2(target.y - player.current.y, target.x - player.current.x);
            }
            projectiles.current.push({
               x: player.current.x + 16,
               y: player.current.y + 16,
               width: 8, height: 8,
               vx: Math.cos(angle) * PROJECTILE_SPEED,
               vy: Math.sin(angle) * PROJECTILE_SPEED,
               id: Date.now()
            });
         } else {
            triggerQuiz();
         }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
       window.removeEventListener('keydown', handleKeyDown);
       window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // --- LOGIC ---
  const triggerQuiz = () => {
     // Filter questions by Current Level
     const levelQuestions: Question[] = [];
     LEVELS.forEach(l => {
         if (l.id === levelId) {
             l.lessons.forEach(ls => ls.questions.forEach(q => {
                 if (q.type !== QuestionType.SORTING) levelQuestions.push(q);
             }));
         }
     });

     // Fallback to any question if level has none valid
     const pool = levelQuestions.length > 0 ? levelQuestions : LEVELS[0].lessons[0].questions;
     const randomQ = pool[Math.floor(Math.random() * pool.length)];
     
     setActiveQuiz(randomQ);
     setGameState('QUIZ');
  };

  const handleQuizAnswer = (answer: string) => {
     if (!activeQuiz) return;
     const correct = answer === activeQuiz.correctAnswer;
     setQuizFeedback(correct);
     
     setTimeout(() => {
        if (correct) {
           player.current.ammo = AMMO_MAX; 
           player.current.score += 200; // Small bonus
        } else {
           // PUNISHMENT: Increase Risk Level (Enemy Speed)
           setRiskLevel(prev => Math.min(prev + 0.5, 3.0)); // Cap at 3x speed
           player.current.score = Math.max(0, player.current.score - 50);
           player.current.ammo = 3; // Pity ammo
        }
        setQuizFeedback(null);
        setActiveQuiz(null);
        setGameState('PLAYING');
     }, 1500);
  };

  const handleInvestment = (gamble: boolean) => {
     if (gamble) {
        if (Math.random() > 0.5) {
           player.current.score = Math.floor(player.current.score * 1.5); // Win 50%
        } else {
           player.current.score = Math.floor(player.current.score * 0.7); // Lose 30%
        }
     }
     setGameState('PLAYING');
  };

  // --- RENDER ---
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden font-retro">
       
       {gameState === 'START' && (
          <div className="text-center space-y-6 z-10 animate-fade-in border-4 border-arcade-yellow p-10 bg-gray-900 max-w-2xl">
             <h1 className="text-6xl text-arcade-yellow mb-2">MISSION: LEVEL {levelId}</h1>
             <div className="text-left bg-black p-4 border border-gray-700 font-mono text-sm text-green-400 mb-4">
                <p>> TARGET: {targetScore} SATS</p>
                <p>> THREAT: SCAM CLOUDS DETECTED</p>
                <p>> PROTOCOL: MINE NODES. DEFEND INTEGRITY.</p>
                <p>> WARNING: INCORRECT ANSWERS INCREASE RISK LEVEL.</p>
             </div>
             <Button variant="arcade" onClick={initGame} size="lg">START MISSION</Button>
             <button onClick={() => onExit(false, 0)} className="block w-full mt-4 text-gray-500 hover:text-white">ABORT MISSION</button>
          </div>
       )}

       {gameState === 'VICTORY' && (
           <div className="text-center space-y-6 z-10 animate-fade-in border-4 border-green-500 p-10 bg-gray-900">
               <h1 className="text-6xl text-green-500">MISSION COMPLETE</h1>
               <p className="text-2xl text-white">TARGET ACQUIRED: {player.current.score} SATS</p>
               <div className="text-yellow-400 animate-pulse text-xl">
                   >>> BONUS ROUND UNLOCKED <<<
               </div>
               <Button variant="arcade" onClick={() => onExit(true, player.current.score)}>PROCEED TO ARCADE</Button>
           </div>
       )}

       {gameState === 'GAME_OVER' && (
          <div className="text-center space-y-6 z-10 animate-shake border-4 border-red-600 p-10 bg-gray-900">
             <h1 className="text-6xl text-red-500">RUG PULLED!</h1>
             <p className="text-xl text-gray-400">Risk Level reached: {riskLevel}x</p>
             <Button variant="arcade" onClick={initGame}>RETRY LEVEL</Button>
             <Button variant="ghost" onClick={() => onExit(false, 0)}>EXIT TO MAP</Button>
          </div>
       )}

       {gameState === 'QUIZ' && activeQuiz && (
          <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-20">
             <div className={`max-w-xl w-full border-4 p-8 bg-gray-900 ${quizFeedback === true ? 'border-green-500' : quizFeedback === false ? 'border-red-500' : 'border-arcade-neon'}`}>
                <div className="flex items-center gap-2 mb-4 text-arcade-neon">
                   <Brain className="w-8 h-8 animate-pulse" />
                   <h2 className="text-3xl">PROOF OF WORK REQUIRED</h2>
                </div>
                
                <p className="text-2xl text-white mb-8 font-sans leading-relaxed">{activeQuiz.prompt}</p>
                
                <div className="grid grid-cols-1 gap-4">
                   {activeQuiz.options.map((opt, idx) => (
                      <button 
                        key={opt}
                        onClick={() => !quizFeedback && handleQuizAnswer(opt)}
                        disabled={quizFeedback !== null}
                        className={`p-4 border-2 text-left text-xl hover:bg-gray-800 transition-colors
                           ${quizFeedback === null ? 'border-white text-white' : ''}
                           ${quizFeedback === true && opt === activeQuiz.correctAnswer ? 'border-green-500 bg-green-900/50 text-green-400' : ''}
                           ${quizFeedback === false && opt !== activeQuiz.correctAnswer ? 'opacity-30 border-gray-700' : ''}
                           ${quizFeedback === false && opt === activeQuiz.correctAnswer ? 'border-green-500 text-green-400' : ''}
                        `}
                      >
                         <span className="mr-4 opacity-50">[{idx+1}]</span> {opt}
                      </button>
                   ))}
                </div>
                
                {quizFeedback === false && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-red-500 text-xl animate-bounce">
                        <AlertTriangle /> WARNING: RISK LEVEL INCREASING!
                    </div>
                )}
             </div>
          </div>
       )}

       {gameState === 'SHOP' && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
             <div className="max-w-lg w-full border-4 border-arcade-pink p-8 bg-gray-900 text-center">
                <div className="flex justify-center mb-4 text-arcade-pink">
                   <DollarSign className="w-16 h-16" />
                </div>
                <h2 className="text-4xl text-white mb-2">VENTURE CAPITALIST</h2>
                <p className="text-gray-400 mb-8 font-sans">"Market volatility detected. Want to leverage your position?"</p>
                
                <div className="flex gap-4 justify-center">
                   <Button variant="arcade" onClick={() => handleInvestment(true)} className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black">
                      LEVERAGE LONG (RISKY)
                   </Button>
                   <Button variant="arcade" onClick={() => handleInvestment(false)} className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black">
                      IGNORE
                   </Button>
                </div>
             </div>
          </div>
       )}

       <canvas 
         ref={canvasRef} 
         width={CANVAS_WIDTH} 
         height={CANVAS_HEIGHT} 
         className="border-2 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gray-900"
       />

    </div>
  );
};

export default MinerVerse;