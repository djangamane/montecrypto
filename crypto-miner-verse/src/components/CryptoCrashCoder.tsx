import React, { useState, useEffect, useRef } from 'react';
import { LEVELS } from '../constants';
import type { Question } from '../types';
import { QuestionType } from '../types';
import Button from './ui/Button';
import { Trophy, Heart, Zap, RefreshCw, XCircle } from 'lucide-react';

interface CryptoCrashCoderProps {
  unlockedLevelId: number;
  onExit: (score: number) => void;
}

const CryptoCrashCoder: React.FC<CryptoCrashCoderProps> = ({ unlockedLevelId, onExit }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER' | 'VICTORY'>('START');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [feedback, setFeedback] = useState<'HIT' | 'MISS' | null>(null);

  // Audio Refs (Mocking sound for now, purely visual in this implementation)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize Game
  const startGame = () => {
    // 1. Gather pool of questions from unlocked levels
    // For Arcade mode, we flatten questions and filter out complex SORTING ones to keep it fast
    // or convert them if possible. Here we stick to Choice/Blank for speed.
    const pool: Question[] = [];
    LEVELS.forEach(level => {
      // Allow questions from current level + previous
      if (level.id <= unlockedLevelId) {
        level.lessons.forEach(lesson => {
          lesson.questions.forEach(q => {
            if (q.type !== QuestionType.SORTING) {
              pool.push(q);
            }
          });
        });
      }
    });

    // Shuffle
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 10); // Limit to 10 waves
    setQuestions(shuffled);
    setCurrentQIndex(0);
    setLives(3);
    setScore(0);
    setTimeLeft(100);
    setGameState('PLAYING');
  };

  // Timer Logic
  useEffect(() => {
    if (gameState === 'PLAYING' && !feedback) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleAnswer(null); // Time out treated as wrong
            return 100;
          }
          return prev - 1.5; // Decay speed
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, feedback, currentQIndex]);

  const handleAnswer = (answer: string | null) => {
    const currentQ = questions[currentQIndex];
    const isCorrect = answer === currentQ.correctAnswer;

    if (isCorrect) {
      setFeedback('HIT');
      setScore(s => s + (Math.ceil(timeLeft) * 10)); // Score based on speed
      setTimeout(nextQuestion, 800);
    } else {
      setFeedback('MISS');
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setTimeout(() => setGameState('GAME_OVER'), 1000);
        } else {
          setTimeout(nextQuestion, 1000);
        }
        return newLives;
      });
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setTimeLeft(100);
    if (currentQIndex + 1 >= questions.length) {
      setGameState('VICTORY');
    } else {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in p-6">
      <div className="relative">
        <h1 className="text-6xl font-retro text-arcade-neon animate-pulse leading-tight">
          CRYPTO<br />CRASH<br />CODER
        </h1>
        <div className="text-arcade-pink font-retro text-2xl mt-2 tracking-widest">
          THE HALVING DEFENDER
        </div>
      </div>

      <div className="bg-gray-900 border-4 border-arcade-cyan p-6 rounded-lg max-w-sm w-full shadow-[0_0_20px_rgba(0,255,255,0.3)]">
        <p className="font-retro text-xl text-gray-300 mb-4">MISSION OBJECTIVE</p>
        <ul className="text-left space-y-2 font-mono text-sm text-arcade-yellow">
          <li>► DEFEND against FUD & Scams</li>
          <li>► SURVIVE 10 Waves of Questions</li>
          <li>► SPEED multiplies your Score</li>
        </ul>
      </div>

      <button
        onClick={startGame}
        className="group relative px-8 py-4 bg-arcade-neon text-black font-retro text-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform"
      >
        <span className="absolute inset-0 border-b-4 border-r-4 border-black group-active:border-0 group-active:translate-x-1 group-active:translate-y-1"></span>
        Insert Coin
      </button>

      <button onClick={() => onExit(0)} className="text-gray-500 font-retro text-lg hover:text-white mt-4 underline">
        Return to Map
      </button>
    </div>
  );

  const renderGameOver = (victory: boolean) => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in p-6">
      <div className={`text-6xl font-retro ${victory ? 'text-arcade-neon' : 'text-danger'} mb-4`}>
        {victory ? 'VICTORY!' : 'GAME OVER'}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-gray-400 font-retro text-xl">FINAL SCORE</span>
        <span className="text-arcade-yellow font-retro text-5xl">{score}</span>
      </div>

      {victory && (
        <div className="flex items-center gap-2 text-arcade-pink font-retro text-xl border border-arcade-pink p-2 rounded">
          <Trophy className="w-6 h-6" /> BADGE UNLOCKED: 8-BIT HERO
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
        <Button onClick={startGame} fullWidth className="font-retro text-xl">
          <RefreshCw className="mr-2 w-5 h-5" /> TRY AGAIN
        </Button>
        <Button onClick={() => onExit(score)} variant="secondary" fullWidth className="font-retro text-xl">
          EXIT GAME
        </Button>
      </div>
    </div>
  );

  const renderGameplay = () => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return null;

    // Visual Shake for Miss
    const shakeClass = feedback === 'MISS' ? 'animate-shake bg-red-900/20' : '';
    const hitClass = feedback === 'HIT' ? 'bg-green-900/20' : '';

    return (
      <div className={`relative flex flex-col h-full p-4 overflow-hidden ${shakeClass} ${hitClass} transition-colors duration-100`}>
        {/* CRT Scanline Effect */}
        <div className="arcade-scanline"></div>

        {/* HUD */}
        <div className="flex justify-between items-end border-b-4 border-gray-800 pb-2 mb-4 font-retro text-xl">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">SCORE</span>
            <span className="text-arcade-yellow">{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < lives ? 'fill-danger text-danger' : 'text-gray-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Enemy / Visual Context Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative mb-4">
          {/* Timer Bar */}
          <div className="absolute top-0 w-full h-4 bg-gray-800 border-2 border-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ease-linear ${timeLeft < 30 ? 'bg-danger animate-pulse' : 'bg-arcade-neon'}`}
              style={{ width: `${timeLeft}%` }}
            ></div>
          </div>

          {/* Retro Question Box */}
          <div className="mt-8 bg-black border-4 border-arcade-cyan p-6 shadow-[8px_8px_0_0_#059669] w-full max-w-lg text-center relative z-10">
            {feedback === 'HIT' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                <span className="text-arcade-neon font-retro text-6xl rotate-12">HIT!</span>
              </div>
            )}
            {feedback === 'MISS' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
                <span className="text-danger font-retro text-6xl -rotate-12">MISS!</span>
              </div>
            )}

            <div className="text-gray-400 font-retro mb-2 text-lg">WAVE {currentQIndex + 1}/{questions.length}</div>
            <h2 className="text-white font-retro text-2xl md:text-3xl leading-snug">
              {currentQ.type === QuestionType.FILL_BLANK ? currentQ.prompt.replace('___', '_____') : currentQ.prompt}
            </h2>
          </div>

          {/* Decorative 8-bit Icons */}
          <div className="absolute bottom-0 w-full flex justify-between px-8 opacity-20 pointer-events-none">
            <Zap className="w-12 h-12 text-arcade-yellow animate-bounce" />
            <Zap className="w-12 h-12 text-arcade-yellow animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-3 pb-safe">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={!!feedback}
              onClick={() => handleAnswer(opt)}
              className={`
                 font-retro text-xl p-4 border-2 rounded active:translate-y-1 transition-all text-left uppercase
                 ${feedback ? 'opacity-50' : 'hover:bg-gray-800 hover:border-white'}
                 ${idx === 0 ? 'border-arcade-neon text-arcade-neon' : ''}
                 ${idx === 1 ? 'border-arcade-pink text-arcade-pink' : ''}
                 ${idx === 2 ? 'border-arcade-cyan text-arcade-cyan' : ''}
                 ${idx === 3 ? 'border-arcade-yellow text-arcade-yellow' : ''}
                 ${(idx > 3) ? 'border-white text-white' : ''}
               `}
            >
              <span className="mr-3 opacity-50">{['A', 'B', 'C', 'D'][idx] || idx + 1}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-arcade-dark z-50 overflow-hidden font-sans">
      {gameState === 'START' && renderStartScreen()}
      {gameState === 'PLAYING' && renderGameplay()}
      {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && renderGameOver(gameState === 'VICTORY')}
    </div>
  );
};

export default CryptoCrashCoder;