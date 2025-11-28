import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { UserProgress, Level, Lesson } from './types';
import { LevelStatus } from './types';
import { LEVELS } from './constants';
import LevelMap from './components/LevelMap';
import RiskAnalyzer from './components/RiskAnalyzer';
import CryptoCrashCoder from './components/CryptoCrashCoder';
import MinerVerse from './components/MinerVerse';
import TradingSimulator from './components/TradingSimulator/App'; // Import Simulator
import Button from './components/ui/Button';
import { Flame, Star, Terminal, ArrowRight } from 'lucide-react';

import bgImage from './assets/minerverse_bg.png';

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'WELCOME' | 'MAP' | 'BRIEFING' | 'MINER_GAME' | 'ARCADE_BONUS' | 'RISK_TOOL' | 'TRADING_SIM' | 'TRAINING' | 'CHAMPIONS'>('WELCOME');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [globalBTC, setGlobalBTC] = useState(0);

  // User Progress with localStorage persistence
  const [user, setUser] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('minerverse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user data', e);
      }
    }
    return {
      currentLevel: 1,
      completedLessonIds: [],
      streakDays: 3,
      xp: 1250,
      badges: [],
      isPro: false
    };
  });

  // Save user progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('minerverse_user', JSON.stringify(user));
  }, [user]);

  // --- WELCOME SCREEN ---
  const renderWelcome = () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <div className="arcade-scanline"></div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="animate-float">
          <h1 className="text-6xl md:text-8xl font-retro text-transparent bg-clip-text bg-gradient-to-b from-arcade-cyan to-blue-600 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            MINER
            <span className="block text-4xl md:text-6xl text-arcade-pink mt-2">VERSE</span>
          </h1>
        </div>

        <p className="text-gray-400 font-mono text-sm md:text-base bg-black/50 p-4 rounded border border-gray-800">
          DECODE THE BLOCKCHAIN. MASTER THE MARKET.
        </p>

        <Button fullWidth variant="primary" size="lg" onClick={() => setView('MAP')}>
          START MISSION <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 gap-3 text-left">
          <button
            onClick={() => setView('TRAINING')}
            className="w-full px-4 py-3 bg-black/60 border border-arcade-cyan/50 hover:border-arcade-cyan text-white font-mono text-sm rounded transition-all"
          >
            <div className="text-arcade-cyan font-bold text-lg">Mission Training</div>
            <div className="text-gray-400 text-xs mt-1">Study zone: video lessons & level briefings</div>
          </button>
          <button
            onClick={() => setView('CHAMPIONS')}
            className="w-full px-4 py-3 bg-black/60 border border-arcade-pink/50 hover:border-arcade-pink text-white font-mono text-sm rounded transition-all"
          >
            <div className="text-arcade-pink font-bold text-lg">Crypto Champions</div>
            <div className="text-gray-400 text-xs mt-1">Hall of fame: top scores & wallets</div>
          </button>
        </div>

        <div className="text-xs text-gray-600 font-mono mt-8">
          v1.0.4 // SYSTEM READY
        </div>
      </div>
    </div>
  );

  // --- ACTIONS ---

  const handleLevelSelect = (level: Level) => {
    // Find lesson content to show as "Briefing"
    // For this game loop, we assume 1 main lesson per level for simplicity, 
    // or we chain them. Let's pick the first uncompleted or just the first one.
    const lesson = level.lessons[0];

    if (lesson) {
      setActiveLevel(level);
      setActiveLesson(lesson);
      setView('BRIEFING');
    }
  };

  const handleLaunchSim = (mode: 'CEX' | 'DEX') => {
    const simLevel = LEVELS.find(l => l.id === (mode === 'CEX' ? 4 : 5)) || null;
    setActiveLevel(simLevel);
    setView('TRADING_SIM');
  };

  const handleStartMission = () => {
    if (!activeLevel) return;

    console.log('🚀 handleStartMission called:', {
      levelId: activeLevel.id,
      levelName: activeLevel.name,
      willGoToSim: activeLevel.id === 4 || activeLevel.id === 5
    });

    // Level 4 = CEX Simulator
    // Level 5 = DEX Simulator
    if (activeLevel.id === 4 || activeLevel.id === 5) {
      console.log('✅ Routing to TRADING_SIM for level', activeLevel.id);
      setView('TRADING_SIM');
    } else {
      console.log('🎮 Routing to MINER_GAME for level', activeLevel.id);
      setView('MINER_GAME');
    }
  };

  const handleMinerComplete = (success: boolean, score: number) => {
    console.log('🎮 handleMinerComplete called:', { success, score, currentView: view });
    if (success) {
      // Add score to XP AND Global Wallet
      setUser(prev => ({ ...prev, xp: prev.xp + score }));
      setGlobalBTC(prev => prev + score);
      // Proceed to Bonus Round
      console.log('✅ Setting view to ARCADE_BONUS');
      setView('ARCADE_BONUS');
    } else {
      // Failed mission, back to map
      console.log('❌ Setting view to MAP');
      setView('MAP');
    }
  };

  const handleArcadeComplete = (score: number) => {
    // Bonus XP AND Global Wallet
    setUser(prev => ({ ...prev, xp: prev.xp + score }));
    setGlobalBTC(prev => prev + score);

    // Unlock Next Level logic
    if (activeLevel && activeLevel.id === user.currentLevel) {
      setUser(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1
      }));
    }

    setView('MAP');
    setActiveLesson(null);
    setActiveLevel(null);
  };

  const handleSimComplete = (finalEquity: number) => {
    // Simulator Complete
    console.log('📈 Simulator Complete. Equity:', finalEquity);

    // Update Global Wallet? Or just XP?
    // Maybe convert final equity to XP or keep it?
    // For now, let's give XP based on profit
    const profit = finalEquity - 50000; // Assuming 50k start
    const xpGain = Math.max(0, Math.floor(profit / 10));

    setUser(prev => ({ ...prev, xp: prev.xp + xpGain }));

    // Unlock Next Level
    if (activeLevel && activeLevel.id === user.currentLevel) {
      setUser(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1
      }));
    }

    setView('MAP');
    setActiveLesson(null);
    setActiveLevel(null);
  };

  const handleRiskScanComplete = () => {
    setUser(prev => ({
      ...prev,
      badges: [...prev.badges, 'b3'],
      xp: prev.xp + 50,
      // Unlock next level if Risk Tool was the current level
      currentLevel: prev.currentLevel === 4 ? 5 : prev.currentLevel
    }));
    setTimeout(() => setView('MAP'), 1000);
  };

  // --- DERIVED STATE ---
  const visibleLevels = LEVELS.map(lvl => ({
    ...lvl,
    status: lvl.id < user.currentLevel
      ? LevelStatus.COMPLETED
      : lvl.id === user.currentLevel
        ? LevelStatus.UNLOCKED
        : LevelStatus.LOCKED
  }));

  // --- RENDER ---
  if (view === 'WELCOME') return renderWelcome();

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-brand-500 selection:text-white flex flex-col"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-orange-400">
              <Flame className="w-5 h-5 fill-orange-400 animate-pulse" />
              <span className="font-bold text-lg">{user.streakDays}</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Star className="w-5 h-5 fill-yellow-400" />
              <span className="font-bold">{user.xp} XP</span>
            </div>
          </div>
          <div className="font-retro text-xl text-arcade-cyan tracking-widest cursor-pointer" onClick={() => setView('WELCOME')}>
            MINER_VERSE
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow relative overflow-y-auto">


        {view === 'MAP' && (
          <div className="max-w-md mx-auto pb-32 pt-8">
            <div className="text-center mb-8">
              <h2 className="text-gray-500 font-retro text-lg">CURRENT OBJECTIVE</h2>
              <div className="text-2xl text-white font-bold uppercase tracking-wider">
                {visibleLevels.find(l => l.id === user.currentLevel)?.name || "MASTERED"}
              </div>
            </div>

            <LevelMap
              levels={visibleLevels}
              currentLevelId={user.currentLevel}
              onSelectLevel={handleLevelSelect}
            />
          </div>
        )}

        {view === 'BRIEFING' && activeLesson && (
          <div className="h-full p-4 md:p-8 flex flex-col items-center justify-center relative">
            <div className="arcade-scanline"></div>
            <div className="max-w-3xl w-full border-4 border-arcade-cyan bg-gray-900/95 p-1 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              <div className="border border-arcade-cyan/30 p-6 md:p-10 flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b-2 border-dashed border-gray-700 pb-4">
                  <Terminal className="text-arcade-pink w-10 h-10" />
                  <div>
                    <h2 className="text-arcade-pink font-retro text-xl">MISSION BRIEFING // LEVEL {activeLevel?.id}</h2>
                    <h1 className="text-4xl text-white font-retro uppercase">{activeLesson.title}</h1>
                  </div>
                </div>

                <div className="font-mono text-green-400 text-lg leading-relaxed bg-black p-6 border-l-4 border-arcade-cyan h-64 overflow-y-auto custom-scrollbar">
                  {activeLesson.content}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-800 p-4 border border-gray-700">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">OBJECTIVE</h3>
                    <p className="text-white font-retro text-xl">
                      {activeLevel?.id === 4 || activeLevel?.id === 5
                        ? "MAXIMIZE PORTFOLIO"
                        : "COLLECT 1000 SATS"}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 border border-gray-700">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">
                      {activeLevel?.id === 4 || activeLevel?.id === 5 ? "DURATION" : "INTEL"}
                    </h3>
                    <p className="text-white font-retro text-xl">
                      {activeLevel?.id === 4 || activeLevel?.id === 5
                        ? "5 MINUTES"
                        : "AVOID SCAM CLOUDS"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <Button fullWidth variant="arcade" onClick={handleStartMission}>
                    {activeLevel?.id === 4 || activeLevel?.id === 5
                      ? `START ${activeLevel?.id === 4 ? 'CEX' : 'DEX'} TRADING`
                      : "DEPLOY MINER"}
                    <ArrowRight className="ml-2" />
                  </Button>
                  <button onClick={() => setView('MAP')} className="w-full text-center text-gray-500 hover:text-white font-retro text-lg uppercase">
                    Cancel Mission
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'MINER_GAME' && activeLevel && (
          <MinerVerse
            levelId={activeLevel.id}
            targetScore={1000 + (activeLevel.id * 200)}
            // Harder targets for higher levels
            onExit={handleMinerComplete}
          />
        )}

        {view === 'TRADING_SIM' && activeLevel && (
          <TradingSimulator
            initialBTC={globalBTC}
            mode={activeLevel.id === 4 ? 'CEX' : 'DEX'}
            onComplete={handleSimComplete}
          />
        )}

        {view === 'RISK_TOOL' && (
          <div className="h-full bg-gray-900 absolute inset-0 z-40 overflow-y-auto p-4">
            <button onClick={() => setView('MAP')} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2">
              ← Back to Map
            </button>
            <RiskAnalyzer
              onComplete={handleRiskScanComplete}
              scansRemaining={5}
            />
          </div>
        )}

        {view === 'TRAINING' && (
          <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-retro text-arcade-cyan">Mission Training</h2>
              <p className="text-gray-400 font-mono text-sm">Level-by-level video lessons and simulations.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {LEVELS.map(level => (
                <div key={level.id} className="border border-gray-800 bg-black/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 font-mono text-xs">LEVEL {level.id}</div>
                      <div className="text-white font-retro text-2xl">{level.name}</div>
                      <p className="text-gray-400 text-sm mt-1">{level.description}</p>
                    </div>
                    <Button size="sm" variant="secondary">Watch Lesson</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-arcade-cyan/40 bg-black/60 p-4 rounded-lg">
                <h3 className="text-arcade-cyan font-retro text-xl mb-2">Enter Simulation (CEX)</h3>
                <p className="text-gray-400 text-sm mb-3">Practice centralized exchange trading with no stakes.</p>
                <Button fullWidth onClick={() => handleLaunchSim('CEX')}>Launch CEX Simulation</Button>
              </div>
              <div className="border border-arcade-pink/40 bg-black/60 p-4 rounded-lg">
                <h3 className="text-arcade-pink font-retro text-xl mb-2">Enter Simulation (DEX)</h3>
                <p className="text-gray-400 text-sm mb-3">Decentralized swap drills with risk prompts.</p>
                <Button fullWidth variant="secondary" onClick={() => handleLaunchSim('DEX')}>Launch DEX Simulation</Button>
              </div>
            </div>
            <div className="text-center">
              <button onClick={() => setView('WELCOME')} className="text-gray-500 hover:text-white font-mono text-xs uppercase">← Back to Welcome</button>
            </div>
          </div>
        )}

        {view === 'CHAMPIONS' && (
          <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-retro text-arcade-pink">Crypto Champions</h2>
              <p className="text-gray-400 font-mono text-sm">Hall of fame for top scores and stacked sats.</p>
            </div>
            <div className="border border-gray-800 bg-black/60 rounded-lg p-4">
              <div className="grid grid-cols-3 text-xs font-mono text-gray-500 mb-2">
                <span>Rank</span>
                <span>Agent</span>
                <span className="text-right">Score</span>
              </div>
              {[
                { name: 'SATSTACKER', score: 58200 },
                { name: 'RISKSCOUT', score: 44150 },
                { name: 'HALVINGHERO', score: 39900 },
              ].map((champ, idx) => (
                <div key={champ.name} className="grid grid-cols-3 items-center py-2 border-t border-gray-800 text-white font-mono">
                  <span className="text-gray-500">#{idx + 1}</span>
                  <span>{champ.name}</span>
                  <span className="text-right text-arcade-cyan">{champ.score.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setView('WELCOME')} className="text-gray-500 hover:text-white font-mono text-xs uppercase">← Back to Welcome</button>
            </div>
          </div>
        )}

      </main>

      {/* ARCADE BONUS - Use portal to render directly to body */}
      {view === 'ARCADE_BONUS' && ReactDOM.createPortal(
        <CryptoCrashCoder
          unlockedLevelId={user.currentLevel}
          onExit={handleArcadeComplete}
        />,
        document.body
      )}
    </div>
  );
};

export default App;
