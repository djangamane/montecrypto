// @ts-nocheck

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

const BG_IMAGE = "/assets/minerverse_bg.png";

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'WELCOME' | 'ONBOARD' | 'LESSON' | 'MAP' | 'BRIEFING' | 'MINER_GAME' | 'ARCADE_BONUS' | 'RISK_TOOL' | 'TRADING_SIM' | 'TRAINING' | 'CHAMPIONS'>('WELCOME');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [globalBTC, setGlobalBTC] = useState(0);
  const [lessonReady, setLessonReady] = useState(false);
  const [lessonWatched, setLessonWatched] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('minerverse_lessons');
    return saved ? JSON.parse(saved) : {};
  });
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboarded, setOnboarded] = useState(() => {
    const paid = localStorage.getItem('minerverse_paid') === 'true';
    if (!paid) return false;
    return localStorage.getItem('minerverse_onboarded') === 'true';
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [practiceMode, setPracticeMode] = useState(false);
  const [isPaid, setIsPaid] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('minerverse_paid') === 'true';
  });
  const [showPaywall, setShowPaywall] = useState(false);

  const stripeCheckoutLinks = {
    monthly: 'https://buy.stripe.com/7sY00k7HN7xA4mU4ffcIE05',
    lifetime: 'https://buy.stripe.com/8x228sd276twcTqcLLcIE06'
  };

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

  // Track paid status from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const paidFlag = localStorage.getItem('minerverse_paid') === 'true';
    setIsPaid(paidFlag);
    if (!paidFlag) {
      setOnboarded(false);
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'minerverse_paid') {
        setIsPaid(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Force onboarding when requested (e.g., from marketing CTA)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const startParam = (params.get('start') || params.get('onboarding') || '').toLowerCase();
    const paidParam = (params.get('paid') || '').toLowerCase();
    let paidFlag = localStorage.getItem('minerverse_paid') === 'true';

    if (paidParam === 'true') {
      localStorage.setItem('minerverse_paid', 'true');
      setIsPaid(true);
      paidFlag = true;
    } else if (paidParam === 'false') {
      localStorage.setItem('minerverse_paid', 'false');
      setIsPaid(false);
      setOnboarded(false);
      paidFlag = false;
    }

    const shouldForceOnboarding = startParam === 'onboarding' || startParam === 'true' || startParam === '1' || startParam === 'menu';
    if (shouldForceOnboarding || !paidFlag) {
      localStorage.setItem('minerverse_onboarded', 'false');
      setOnboarded(false);
      setOnboardStep(0);
      setView('ONBOARD');
      return;
    }
    if (startParam === 'home' || startParam === 'welcome') {
      setView('WELCOME');
    }
    if (startParam === 'map') {
      setView('MAP');
    }
  }, []);

  // Keep paid-only views locked
  useEffect(() => {
    if (!isPaid && (view === 'TRAINING' || view === 'CHAMPIONS')) {
      setView('WELCOME');
      setShowPaywall(true);
    }
    if (!isPaid && (view === 'MAP' || view === 'MINER_GAME' || view === 'ARCADE_BONUS' || view === 'TRADING_SIM')) {
      setView('ONBOARD');
    }
  }, [isPaid, view]);

  // --- ONBOARDING CONFIG ---
  const onboardingSteps = [
    { id: 'q1', type: 'choice', title: 'Your goal with digital assets', prompt: 'What is your primary goal right now?', options: ['Grow long-term stack', 'Trade short-term swings', 'Learn without losing money', 'Build confidence before investing'] },
    { id: 'q2', type: 'choice', title: 'Critical skill', prompt: 'Which risk skill do you most urgently want to master?', options: ['Strategy & scarcity (Level 3)', 'Spotting red flags (Level 4)', 'Understanding CEX/DEX (Levels 4-5)'] },
    { id: 'q3', type: 'multi', title: 'Transformation', prompt: 'What will mastering risk let you achieve?', options: ['Avoid costly mistakes', 'Save time vs research rabbit holes', 'Reduce stress & FUD', 'Feel pro-level confidence'] },
    { id: 'info1', type: 'info', title: 'Experience first. Hype never.', body: 'We have tracked scams and risk anomalies since 2017. Visit our YouTube channel for legacy walkthroughs that show our commitment to proper crypto education: https://www.youtube.com/@aicryptorisk' },
    { id: 'q4', type: 'scale', title: 'Overwhelm check', prompt: 'How overwhelmed are you by scams/volatility?', options: ['1-2 Chill', '3-4 Mild', '5-6 Concerned', '7-8 Stressed', '9-10 Maxed'] },
    { id: 'q5', type: 'choice', title: 'Time spent', prompt: 'Time you want to spend manually researching each week?', options: ['0-1 hour', '1-3 hours', '3-5 hours', '5+ hours'] },
    { id: 'q6', type: 'choice', title: 'Tokenomics comfort', prompt: "Do you check tokenomics/max supply (e.g., BTC's 21M) before investing?", options: ['Yes', 'No'] },
    { id: 'info2', type: 'info', title: 'Your path to mastery', body: 'Linear plan: Foundation → Mechanics → Strategy → Risk Decoding → Simulators. You are 10% on your way to mastering risk assessment.' },
    { id: 'q7', type: 'choice', title: 'Signal stacking', prompt: 'Do you know how to combine on-chain, off-chain, social, and institutional signals?', options: ['Yes, confident', 'Somewhat', 'No, need guidance'] },
    { id: 'q8', type: 'choice', title: 'Exchange risk', prompt: 'Which worries you more?', options: ['CEX leverage/liquidations', 'DEX rugs/liquidity traps'] },
    { id: 'q9', type: 'email', title: 'Secure your plan & discount', prompt: 'Enter your email to lock your personalized plan.', options: [] },
    { id: 'info3', type: 'info', title: 'Core value', body: 'Structured, handheld curriculum + AI Risk Tool (150 scans/month) + Weekly Scam Watch Newsletter. Experience first, hype never.' },
  ];

  // --- WELCOME SCREEN ---
  const renderWelcome = () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <div className="arcade-scanline"></div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="animate-float">
          <h1 className="text-6xl md:text-8xl font-retro text-transparent bg-clip-text bg-gradient-to-b from-arcade-cyan to-blue-600 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
            SCAM
            <span className="block text-4xl md:text-6xl text-arcade-pink mt-2">SHOOTER</span>
          </h1>
        </div>

        <p className="text-gray-400 font-mono text-sm md:text-base bg-black/50 p-4 rounded border border-gray-800">
          DECODE THE BLOCKCHAIN. MASTER THE MARKET.
        </p>

        <Button fullWidth variant="primary" size="lg" onClick={() => setView(isPaid && onboarded ? 'MAP' : 'ONBOARD')}>
          START MISSION <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 gap-3 text-left">
          <button
            onClick={() => {
              if (!isPaid) {
                setShowPaywall(true);
                return;
              }
              setView('TRAINING');
            }}
            className={`w-full px-4 py-3 bg-black/60 border text-white font-mono text-sm rounded transition-all ${isPaid ? 'border-arcade-cyan/50 hover:border-arcade-cyan' : 'border-gray-700 cursor-pointer opacity-80'}`}
          >
            <div className="text-arcade-cyan font-bold text-lg flex items-center gap-2">
              Mission Training
              {!isPaid && <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">Locked</span>}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {isPaid ? 'Study zone: video lessons & level briefings' : 'Unlock with purchase to access training'}
            </div>
          </button>
          <button
            onClick={() => {
              if (!isPaid) {
                setShowPaywall(true);
                return;
              }
              setView('CHAMPIONS');
            }}
            className={`w-full px-4 py-3 bg-black/60 border text-white font-mono text-sm rounded transition-all ${isPaid ? 'border-arcade-pink/50 hover:border-arcade-pink' : 'border-gray-700 cursor-pointer opacity-80'}`}
          >
            <div className="text-arcade-pink font-bold text-lg flex items-center gap-2">
              Crypto Champions
              {!isPaid && <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">Locked</span>}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {isPaid ? 'Hall of fame: top scores & wallets' : 'Unlock with purchase to view the leaderboard'}
            </div>
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
    const lesson = level.lessons[0];
    setPracticeMode(false);
    if (lesson) {
      setActiveLevel(level);
      setActiveLesson(lesson);
      if (lessonWatched[level.id]) {
        setView('BRIEFING');
      } else {
        setLessonReady(false);
        setView('LESSON');
      }
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
    if (practiceMode) {
      setPracticeMode(false);
      setView('TRAINING');
      return;
    }
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
        backgroundImage: `url(${BG_IMAGE})`,
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
            SCAM SHOOTER
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

        {view === 'LESSON' && activeLevel && (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{
              backgroundImage: `url(${BG_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}>
            <div className="arcade-scanline"></div>
            <div className="max-w-3xl w-full bg-gray-900/90 border border-arcade-cyan/40 rounded-lg p-4 md:p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-gray-500 font-mono text-xs">LEVEL {activeLevel.id}</div>
                  <h2 className="text-3xl text-white font-retro">{activeLevel.name} Lesson</h2>
                </div>
                <span className="text-xs font-mono text-gray-400">{lessonReady ? 'Ready' : 'Watch to unlock'}</span>
              </div>
              <div className="aspect-video w-full bg-black border border-gray-800 mb-4">
                {activeLevel.videoSrc ? (
                  <video
                    key={activeLevel.videoSrc}
                    controls
                    className="w-full h-full object-contain"
                    onEnded={() => {
                      setLessonReady(true);
                      setLessonWatched(prev => {
                        const next = { ...prev, [activeLevel.id]: true };
                        localStorage.setItem('minerverse_lessons', JSON.stringify(next));
                        return next;
                      });
                    }}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      if (!lessonReady && el.duration && el.currentTime / el.duration > 0.9) {
                        setLessonReady(true);
                        setLessonWatched(prev => {
                          const next = { ...prev, [activeLevel.id]: true };
                          localStorage.setItem('minerverse_lessons', JSON.stringify(next));
                          return next;
                        });
                      }
                    }}
                  >
                    <source src={activeLevel.videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">Lesson video missing.</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <a
                  href={activeLevel.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-arcade-cyan text-sm font-mono underline"
                >
                  Watch on YouTube
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('MAP')}
                    className="px-4 py-2 text-sm font-mono text-gray-400 hover:text-white"
                  >
                    ← Cancel
                  </button>
                  <Button
                    onClick={() => setView('BRIEFING')}
                    disabled={!lessonReady}
                    variant="arcade"
                  >
                    {lessonReady ? 'Continue to Mission' : 'Watch to Unlock'}
                  </Button>
                </div>
              </div>
            </div>
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

        {view === 'ONBOARD' && (
          <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="arcade-scanline"></div>
            <div className="max-w-3xl w-full bg-gray-900/90 border border-arcade-cyan/40 p-6 md:p-10 relative z-10 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-retro text-arcade-cyan">Mission Onboarding</h2>
                <div className="text-sm font-mono text-gray-400">Step {onboardStep + 1} / {onboardingSteps.length}</div>
              </div>
              <div className="space-y-4">
                {(() => {
                  const step = onboardingSteps[onboardStep];
                  if (!step) return null;
                  if (step.type === 'info') {
                    return (
                      <div className="space-y-3">
                        <div className="text-lg text-gray-300 font-retro">{step.title}</div>
                        <p className="text-gray-400 font-mono text-sm leading-relaxed">{step.body}</p>
                      </div>
                    );
                  }
                  if (step.type === 'choice' || step.type === 'multi') {
                  return (
                    <div className="space-y-3">
                      <div className="text-lg text-gray-300 font-retro">{step.title}</div>
                      <p className="text-gray-400 font-mono text-sm">{step.prompt}</p>
                      <div className="grid grid-cols-1 gap-3">
                        {(step.options ?? []).map(opt => {
                          const selected = answers[step.id] === opt || (answers[step.id]?.includes?.(opt));
                            return (
                              <button
                                key={opt}
                                onClick={() => setAnswers(prev => ({ ...prev, [step.id]: step.type === 'multi' ? (prev[step.id] ? `${prev[step.id]}, ${opt}` : opt) : opt }))}
                                className={`text-left px-4 py-3 border rounded transition-all ${selected ? 'border-arcade-cyan text-white bg-black/60' : 'border-gray-700 text-gray-300 hover:border-arcade-cyan'}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (step.type === 'scale') {
                    return (
                      <div className="space-y-3">
                        <div className="text-lg text-gray-300 font-retro">{step.title}</div>
                        <p className="text-gray-400 font-mono text-sm">{step.prompt}</p>
                        <div className="flex flex-wrap gap-2">
                          {(step.options ?? []).map(opt => {
                            const selected = answers[step.id] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => setAnswers(prev => ({ ...prev, [step.id]: opt }))}
                                className={`px-3 py-2 border text-sm font-mono rounded ${selected ? 'border-arcade-pink text-white bg-black/60' : 'border-gray-700 text-gray-300 hover:border-arcade-pink'}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  if (step.type === 'email') {
                    return (
                      <div className="space-y-3">
                        <div className="text-lg text-gray-300 font-retro">{step.title}</div>
                        <p className="text-gray-400 font-mono text-sm">{step.prompt}</p>
                        <input
                          type="email"
                          className="w-full bg-black/60 border border-arcade-cyan/50 text-white px-3 py-2 rounded outline-none"
                          placeholder="you@example.com"
                          value={answers[step.id] || ''}
                          onChange={e => setAnswers(prev => ({ ...prev, [step.id]: e.target.value }))}
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setOnboardStep(s => Math.max(0, s - 1))}
                  className="text-gray-500 hover:text-white font-mono text-sm"
                  disabled={onboardStep === 0}
                >
                  ← Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (onboardStep < onboardingSteps.length - 1) {
                        setOnboardStep(s => s + 1);
                      } else {
                        if (isPaid) {
                          localStorage.setItem('minerverse_onboarded', 'true');
                          setOnboarded(true);
                          setView('MAP');
                        } else {
                          setShowPaywall(true);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-arcade-cyan text-black font-retro rounded shadow hover:scale-105 transition-transform"
                  >
                    {onboardStep === onboardingSteps.length - 1 ? 'Continue to Game' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'TRAINING' && (
          <div className="min-h-screen w-full flex flex-col items-center px-4 py-10 pb-28 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-retro text-arcade-cyan">Mission Training</h2>
              <p className="text-gray-400 font-mono text-sm">Level-by-level video lessons and simulations.</p>
            </div>
            <div className="max-w-4xl w-full space-y-6">
              <div className="border border-arcade-yellow/40 bg-black/60 p-4 rounded-lg">
              <h3 className="text-arcade-yellow font-retro text-xl mb-2">Practice Scam Shooter</h3>
              <p className="text-gray-400 text-sm mb-3">Run the game without the arcade bonus. Mini quizzes stay on.</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map(lid => (
                    <Button
                      key={lid}
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const lvl = LEVELS.find(l => l.id === lid) || null;
                        if (lvl) {
                          setPracticeMode(true);
                          setActiveLevel(lvl);
                          setActiveLesson(lvl.lessons[0] || null);
                          setView('MINER_GAME');
                        }
                      }}
                    >
                      Practice Level {lid}
                    </Button>
                  ))}
                </div>
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
                      <a
                        href={level.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 border border-arcade-cyan/50 text-arcade-cyan text-sm font-mono rounded hover:bg-arcade-cyan/10"
                      >
                        Watch Lesson
                      </a>
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

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-arcade-cyan/40 bg-gray-900/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-white font-mono text-sm"
              aria-label="Close paywall"
            >
              ✕
            </button>
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-arcade-cyan">Access Locked</div>
              <h3 className="text-2xl font-retro text-white">Unlock Scam Shooter</h3>
              <p className="text-sm text-gray-300 font-mono">
                Choose a plan to unlock Mission Training, Crypto Champions, and the full arcade loop.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <a
                href={stripeCheckoutLinks.monthly}
                className="block w-full rounded-lg bg-gradient-to-r from-arcade-pink via-arcade-yellow to-arcade-cyan px-4 py-3 text-center font-retro text-black shadow-[0_10px_35px_rgba(24,224,255,0.35)] hover:scale-[1.01] transition-transform"
              >
                Buy Monthly – $19.99
              </a>
              <a
                href={stripeCheckoutLinks.lifetime}
                className="block w-full rounded-lg border border-arcade-cyan/50 bg-black/60 px-4 py-3 text-center font-retro text-arcade-cyan hover:bg-arcade-cyan/10 transition-colors"
              >
                Buy Lifetime – $299
              </a>
            </div>
            <div className="mt-4 text-xs text-gray-400 font-mono space-y-1">
              <p>Already paid? Complete checkout and you&apos;ll be redirected to set access.</p>
              <p>Need help? Ping info@diplomacy-ai.tech with your receipt.</p>
            </div>
          </div>
        </div>
      )}

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
