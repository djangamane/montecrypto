// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import {
    ComposedChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { Candle, Portfolio, TradeLog, OrderBookItem, NewsItem } from './types';
import { AssetType } from './types';
import { generateInitialMarket, generateNextTick, generateOrderBook, getPortfolioValue, generateNextScamPrice } from './services/marketService';
import { getAnalystInsight } from './services/geminiService';
import { Card, Button, Badge, Modal, ProgressBar, Toast, RiskMeter, NewsTicker } from './components/RetroComponents';
import { TradingTerminal } from './components/TradingTerminal';
import { DexSwap } from './components/DexSwap';

// Constants
const INITIAL_CASH = 50000;
const GAME_DURATION = 300; // 5 minutes
const XP_PER_LEVEL = 1000;

// Custom Candlestick Shape
const Candlestick = (props: any) => {
    const { x, y, width, height, low, high, open, close } = props;
    const isUp = close > open;
    const color = isUp ? '#00ff9d' : '#ff0055'; // Neon Green vs Neon Pink

    const pixelHeight = height;
    const valueDiff = Math.abs(open - close);
    const pixelsPerUnit = valueDiff === 0 ? 0 : pixelHeight / valueDiff;

    if (valueDiff === 0) return <line x1={x} x2={x + width} y1={y} y2={y} stroke={color} />;

    const bodyTopVal = Math.max(open, close);
    const highDiff = high - bodyTopVal;
    const highPixelHeight = highDiff * pixelsPerUnit;

    const bodyBottomVal = Math.min(open, close);
    const lowDiff = bodyBottomVal - low;
    const lowPixelHeight = lowDiff * pixelsPerUnit;

    const cx = x + width / 2;

    return (
        <g>
            <line x1={cx} y1={y - highPixelHeight} x2={cx} y2={y} stroke={color} strokeWidth={2} />
            <line x1={cx} y1={y + height} x2={cx} y2={y + height + lowPixelHeight} stroke={color} strokeWidth={2} />
            <rect x={x} y={y} width={width} height={height} fill={color} stroke={color} strokeWidth={1} />
        </g>
    );
};

interface Notification {
    id: number;
    message: string;
    type: 'info' | 'success' | 'danger';
}

interface TradingSimProps {
    initialBTC: number;
    mode: 'CEX' | 'DEX';
    onComplete: (finalEquity: number) => void;
}

const App: React.FC<TradingSimProps> = ({ initialBTC, mode, onComplete }) => {
    // Data State
    const [candles, setCandles] = useState<Candle[]>([]);
    const [scamPrice, setScamPrice] = useState<number>(0.15); // Initial ScamCoin Price
    const [scamHistory, setScamHistory] = useState<{ time: number, price: number }[]>([]);

    const [portfolio, setPortfolio] = useState<Portfolio>({
        cash: INITIAL_CASH,
        btc: initialBTC,
        scam: 0,
        avgBuyPrice: 0,
        leverage: 1,
        liquidationPrice: 0,
        history: []
    });
    const [orderBook, setOrderBook] = useState<{ bids: OrderBookItem[], asks: OrderBookItem[] }>({ bids: [], asks: [] });
    const [trades, setTrades] = useState<TradeLog[]>([]);
    const [latestNews, setLatestNews] = useState<NewsItem | null>(null);

    // Game State
    const [gameStarted, setGameStarted] = useState(false); // Intro screen
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameOver, setGameOver] = useState(false);

    // Progression State
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [toasts, setToasts] = useState<Notification[]>([]);

    // UI State
    const [analystMsg, setAnalystMsg] = useState<string>("MARKET OPEN. GOOD LUCK TRADER.");
    const [analystLoading, setAnalystLoading] = useState(false);
    const [showWallet, setShowWallet] = useState(false);

    const intervalRef = useRef<any>(null);
    const timerRef = useRef<any>(null);

    // Notification System
    const notify = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // XP System
    const addXp = (amount: number) => {
        setXp(prev => {
            const newXp = prev + amount;
            if (newXp >= level * XP_PER_LEVEL) {
                setLevel(l => l + 1);
                notify(`LEVEL UP! WELCOME TO LEVEL ${level + 1}`, 'success');
            }
            return newXp;
        });
    };

    // Initialize Data
    useEffect(() => {
        const initialData = generateInitialMarket(40);
        setCandles(initialData);
        setOrderBook(generateOrderBook(initialData[initialData.length - 1].close));

        // Fill SCAM history
        const initScam: any[] = [];
        let p = 0.15;
        for (let i = 0; i < 40; i++) {
            p = generateNextScamPrice(p);
            initScam.push({ time: Date.now() - (40 - i) * 1000, price: p });
        }
        setScamHistory(initScam);
        setScamPrice(p);
    }, []);

    // Game Loop
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        intervalRef.current = setInterval(() => {
            // 1. Update BTC & News
            setCandles(prev => {
                const last = prev[prev.length - 1];
                const { candle: newCandle, news } = generateNextTick(last);

                if (news) {
                    setLatestNews(news);
                    notify("NEW MARKET HEADLINE", news.sentiment === 'NEGATIVE' ? 'danger' : 'info');
                }

                const newHistory = [...prev.slice(1), newCandle];
                setOrderBook(generateOrderBook(newCandle.close));

                // CHECK CEX LIQUIDATION
                setPortfolio(currPort => {
                    if (currPort.btc > 0 && currPort.leverage > 1 && currPort.liquidationPrice > 0) {
                        if (newCandle.low <= currPort.liquidationPrice) {
                            // LIQUIDATED!
                            notify("❌ LIQUIDATION! MARGIN CALL EXECUTED. POSITION WIPED.", 'danger');
                            addXp(-500);
                            return {
                                ...currPort,
                                btc: 0,
                                avgBuyPrice: 0,
                                leverage: 1,
                                liquidationPrice: 0
                            };
                        }
                    }
                    return currPort;
                });

                return newHistory;
            });

            // 2. Update SCAM Coin & Check Rugs
            setScamPrice(prev => {
                const next = generateNextScamPrice(prev);

                // RUG PULL DETECTION (Drop > 50% in 1 tick)
                if (next < prev * 0.5) {
                    notify("⚠️ RUG PULL DETECTED ON SCAM COIN! ⚠️", 'danger');
                    // Penalize if holding
                    setPortfolio(currPort => {
                        if (currPort.scam > 0) {
                            addXp(-200);
                            notify("YOU GOT RUGGED! -200 XP", 'danger');
                        }
                        return currPort;
                    });
                }

                setScamHistory(h => [...h.slice(1), { time: Date.now(), price: next }]);
                return next;
            });

        }, 1000);

        // Timer Loop
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    clearInterval(intervalRef.current);
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(intervalRef.current);
            clearInterval(timerRef.current);
        };
    }, [gameStarted, gameOver]);

    // Update Portfolio Valuation
    useEffect(() => {
        if (candles.length === 0) return;
        const currentPrice = candles[candles.length - 1].close;

        setPortfolio(prev => {
            const newVal = getPortfolioValue(prev, currentPrice, scamPrice);
            return {
                ...prev,
                history: [...prev.history, { time: Date.now(), totalValue: newVal }]
            };
        });
    }, [candles, scamPrice]);

    const handleTrade = (type: 'BUY' | 'SELL', amountBTC: number, leverage: number) => {
        if (gameOver) return;
        const currentPrice = candles[candles.length - 1].close;

        // Cost calculation (Collateral needed)
        // BTC Position Value = amountBTC * currentPrice
        // Collateral Needed = Position Value / Leverage
        const collateralNeeded = (amountBTC * currentPrice) / leverage;

        // Since amountBTC calculated in TradingTerminal ALREADY accounted for leverage (it's the full position size),
        // we just need to ensure we have the collateral (USD) to support that size.

        if (type === 'BUY') {
            if (portfolio.cash >= collateralNeeded) {

                // Calculate Liquidation Price for this position
                // Simple logic: If price drops such that PnL = -Collateral
                // LiqPrice = EntryPrice * (1 - 1/Leverage)
                const liqPrice = currentPrice * (1 - (1 / leverage));

                setPortfolio(prev => {
                    // Weighted average for existing position?
                    // For simulator simplicity: Resets Avg Price if adding leverage, or averages it.
                    // Let's simplified: Add to position.
                    const newTotalBTC = prev.btc + amountBTC;
                    const newAvgPrice = ((prev.avgBuyPrice * prev.btc) + (currentPrice * amountBTC)) / newTotalBTC;

                    // If leverage is higher than current, update it? Riskier.
                    const effectiveLeverage = Math.max(prev.leverage, leverage);

                    // Recalculate blended liquidation price
                    const blendedLiqPrice = newAvgPrice * (1 - (1 / effectiveLeverage));

                    return {
                        ...prev,
                        cash: prev.cash - collateralNeeded,
                        btc: newTotalBTC,
                        avgBuyPrice: newAvgPrice,
                        leverage: effectiveLeverage,
                        liquidationPrice: blendedLiqPrice
                    };
                });

                addTradeLog('BUY', AssetType.BTC, amountBTC, currentPrice, leverage);
                notify(`LONG ${amountBTC.toFixed(4)} BTC ${leverage > 1 ? `(${leverage}x LEVERAGE)` : ''}`, 'success');
                addXp(10 * leverage); // More XP for risk
            }
        } else {
            if (portfolio.btc >= amountBTC) {
                // Sell logic
                // Return collateral + profit
                const avgEntry = portfolio.avgBuyPrice;
                const pnlPerBTC = currentPrice - avgEntry;
                const totalPnL = pnlPerBTC * amountBTC;

                // Original collateral for this chunk? 
                // Approximation: Collateral = (amountBTC * avgEntry) / leverage
                const collateralReleased = (amountBTC * avgEntry) / portfolio.leverage;

                setPortfolio(prev => {
                    const remainingBTC = prev.btc - amountBTC;
                    return {
                        ...prev,
                        cash: prev.cash + collateralReleased + totalPnL,
                        btc: remainingBTC,
                        avgBuyPrice: remainingBTC <= 0.000001 ? 0 : prev.avgBuyPrice,
                        leverage: remainingBTC <= 0.000001 ? 1 : prev.leverage,
                        liquidationPrice: remainingBTC <= 0.000001 ? 0 : prev.liquidationPrice
                    };
                });

                addTradeLog('SELL', AssetType.BTC, amountBTC, currentPrice);

                if (totalPnL > 0) {
                    notify(`CLOSED POSITION. PROFIT: +$${totalPnL.toFixed(2)}`, 'success');
                    addXp(50 * portfolio.leverage);
                } else {
                    notify(`CLOSED POSITION. LOSS: $${totalPnL.toFixed(2)}`, 'danger');
                    addXp(5);
                }
            }
        }
    };

    const handleDexSwap = (type: 'BUY' | 'SELL', amountUSD: number) => {
        if (gameOver) return;
        const gas = 50;
        const effectiveAmount = amountUSD - gas;

        if (effectiveAmount <= 0) {
            notify("INSUFFICIENT FUNDS FOR GAS", 'danger');
            return;
        }

        if (type === 'BUY') { // USD -> SCAM
            if (portfolio.cash >= amountUSD) {
                const scamAmt = effectiveAmount / scamPrice;
                setPortfolio(prev => ({
                    ...prev,
                    cash: prev.cash - amountUSD,
                    scam: prev.scam + scamAmt
                }));
                addTradeLog('BUY', AssetType.SCAM, scamAmt, scamPrice);
                notify(`SWAPPED $${amountUSD.toFixed(0)} FOR SCAM COIN. GOOD LUCK.`, 'info');
                addXp(5);
            }
        } else { // SCAM -> USD
            const scamUnits = amountUSD / scamPrice;
            if (portfolio.scam >= scamUnits) {
                setPortfolio(prev => ({
                    ...prev,
                    scam: prev.scam - scamUnits,
                    cash: prev.cash + (scamUnits * scamPrice) - gas
                }));
                addTradeLog('SELL', AssetType.SCAM, scamUnits, scamPrice);
                notify(`DUMPED SCAM COIN. +$${(scamUnits * scamPrice).toFixed(0)}`, 'success');
                addXp(100);
            }
        }
    };

    const addTradeLog = (type: 'BUY' | 'SELL', asset: AssetType, amount: number, price: number, leverage: number = 1) => {
        setTrades(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            time: Date.now(),
            type,
            asset,
            amount,
            price,
            total: amount * price,
            leverage
        }, ...prev].slice(0, 20));
    };

    const getInsight = async () => {
        if (analystLoading) return;
        setAnalystLoading(true);
        const msg = await getAnalystInsight(portfolio, candles);
        setAnalystMsg(msg);
        setAnalystLoading(false);
        addXp(20); // Reward for using tools
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (candles.length === 0) return <div className="bg-background h-screen text-primary font-retro flex items-center justify-center">INITIALIZING LINK...</div>;

    const currentCandle = candles[candles.length - 1];
    const priceChange = currentCandle.close - candles[candles.length - 2].close;

    const chartData = candles.map(c => ({
        ...c,
        body: [Math.min(c.open, c.close), Math.max(c.open, c.close)]
    }));

    const currentPrice = currentCandle.close;
    // Valuation logic adjusted for leverage? 
    // Portfolio Value = Cash + (BTC Position Value - Borrowed)
    // Borrowed = Position Value - Collateral.
    // Actually simpler: Value = Cash + Collateral + PnL.
    // PnL = (Current - Entry) * BTC.
    // So Value = Cash + (Entry * BTC / Leverage) + (Current - Entry) * BTC
    // Let's stick to the simple calc: Total Assets. 
    // BUT with leverage, BTC amount is huge, so simple mult is wrong if we don't subtract liability.
    // Simplified for Arcade: Unrealized Value = Cash + (Collateral + PnL)
    // PnL = (Current - Avg) * BTC
    const pnl = portfolio.btc * (currentPrice - portfolio.avgBuyPrice);
    const collateralLocked = (portfolio.btc * portfolio.avgBuyPrice) / (portfolio.leverage || 1);

    // Total Equity = Free Cash + Collateral + PnL + ScamValue
    const totalBalance = portfolio.cash + collateralLocked + pnl + (portfolio.scam * scamPrice);

    const pnlPercent = portfolio.btc > 0 && portfolio.avgBuyPrice > 0
        ? ((currentPrice - portfolio.avgBuyPrice) / portfolio.avgBuyPrice) * 100 * portfolio.leverage
        : 0;

    // Calculate Risk Level (0-100) based on SCAM allocation + Leverage
    const leverageRisk = (portfolio.leverage - 1) * 2; // 10x = 18pts
    const riskLevel = Math.min(100, Math.round(((portfolio.scam * scamPrice) / (totalBalance || 1)) * 100) + leverageRisk);

    return (
        <div className="min-h-screen bg-background text-text font-sans flex flex-col scanlines overflow-hidden relative">

            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[60] flex flex-col items-end pointer-events-none">
                {toasts.map(t => (
                    <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
                ))}
            </div>

            {/* Start Screen Modal */}
            <Modal isOpen={!gameStarted && !gameOver} onClose={() => { }} title="SYSTEM BOOT">
                <div className="flex flex-col gap-6 p-2 text-center">
                    <div className="text-4xl font-retro text-primary glitch" data-text="AI CRYPTO RISK">AI CRYPTO RISK</div>
                    <div className="font-mono text-sm text-gray-300 space-y-4 text-left border border-primary/30 p-4 rounded bg-black/40">
                        <p className="text-primary font-bold">{'>'} MISSION BRIEFING:</p>
                        <p>{'>'} STARTING CAPITAL: $50,000</p>
                        <p>{'>'} TIME LIMIT: 5 MINUTES</p>
                        <p>{'>'} OBJECTIVE: Grow your portfolio while managing volatility.</p>
                        <p className="text-secondary">{'>'} WARNING: DEX Markets contain &apos;SCAM&apos; tokens.</p>
                        <p className="text-danger">{'>'} WARNING: CEX Leverage {'>'} 5x risks instant LIQUIDATION.</p>
                    </div>
                    <Button onClick={() => {
                        setGameStarted(true);
                        notify("SYSTEM ONLINE. TRADING ACTIVE.", 'info');
                    }} variant="primary" fullWidth className="font-retro animate-pulse">
                        INITIALIZE SYSTEM
                    </Button>
                </div>
            </Modal>

            {/* Navbar */}
            <nav className="border-b-2 border-border h-16 flex items-center px-6 justify-between bg-surface shadow-[0_0_15px_rgba(0,240,255,0.1)] z-50">
                <div className="flex items-center gap-6">
                    <div className="hidden md:block">
                        <h1 className="text-xl font-retro text-white tracking-tighter drop-shadow-[2px_2px_0px_#b026ff]">
                            AI Crypto <span className="text-primary">Ri$k</span>
                        </h1>
                    </div>

                    {/* Mode Indicator (Locked) */}
                    <div className="flex bg-black p-1 rounded border border-gray-700">
                        <div className={`px-3 py-1 text-xs font-bold rounded ${mode === 'CEX' ? 'bg-primary text-black' : 'bg-secondary text-white'}`}>
                            {mode} MODE
                        </div>
                    </div>

                    <RiskMeter riskLevel={riskLevel} />

                    <div className="hidden md:flex gap-4">
                        <div className={`font-mono text-2xl font-bold px-4 py-1 border-2 rounded ${timeLeft < 60 ? 'border-danger text-danger animate-pulse' : 'border-primary text-primary'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-1/3 justify-end">
                    <div className="flex-1 max-w-[200px] hidden md:block">
                        <ProgressBar current={xp} max={level * XP_PER_LEVEL} label={`LVL ${level}`} color="bg-secondary" />
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-retro text-textSecondary uppercase mb-1">Equity</div>
                        <div className="font-mono text-xl font-medium text-white">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    </div>
                    <button
                        onClick={() => setShowWallet(true)}
                        className="h-10 w-10 border-2 border-primary rounded bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-all text-primary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Timer Bar */}
            <div className="md:hidden bg-surface border-b border-border p-2 flex justify-center items-center gap-4">
                <div className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-danger' : 'text-primary'}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="w-32">
                    <ProgressBar current={xp} max={level * XP_PER_LEVEL} label={`LVL ${level}`} color="bg-secondary" />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 lg:overflow-hidden relative">

                {mode === 'CEX' ? (
                    <>
                        {/* Left: Chart & Stats */}
                        <div className="lg:col-span-9 flex flex-col gap-2">

                            {/* Ticker Header */}
                            <Card className="p-4 flex items-center justify-between bg-surface relative overflow-hidden group">
                                {/* Background decorative elements */}
                                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/10 to-transparent"></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="h-10 w-10 rounded border-2 border-orange-500 bg-orange-500/20 flex items-center justify-center font-retro font-bold text-orange-500 text-sm">₿</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-retro text-sm md:text-base text-white">BTC-USD</span>
                                            <Badge type="neutral">SIM</Badge>
                                            {portfolio.leverage > 1 && (
                                                <Badge type="danger">{portfolio.leverage}X MARGIN</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-8 text-right md:text-left relative z-10">
                                    <div>
                                        <div className={`text-2xl md:text-3xl font-mono font-bold drop-shadow-md ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                            ${currentCandle.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Chart Area */}
                            <Card className="flex-1 min-h-[350px] relative bg-surface p-2 border-2 border-border/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                                        <CartesianGrid stroke="#2d1b69" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                        <XAxis
                                            dataKey="dateStr"
                                            stroke="#8a8ab5"
                                            tick={{ fontSize: 12, fontFamily: 'VT323' }}
                                            minTickGap={30}
                                        />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            orientation="right"
                                            stroke="#8a8ab5"
                                            tick={{ fontSize: 12, fontFamily: 'VT323' }}
                                            tickFormatter={(val: number | string) => {
                                              const num = typeof val === 'number' ? val : Number(val);
                                              return Number.isFinite(num) ? num.toFixed(0) : '';
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f1123', border: '1px solid #00f0ff', fontFamily: 'VT323', fontSize: '18px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ stroke: '#b026ff', strokeWidth: 1 }}
                                        />
                                        {portfolio.liquidationPrice > 0 && (
                                            <line
                                                y={portfolio.liquidationPrice}
                                                stroke="red"
                                                strokeDasharray="5 5"
                                            />
                                        )}
                                        <Bar
                                            dataKey="body"
                                            shape={<Candlestick open={0} close={0} high={0} low={0} />}
                                            isAnimationActive={false}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>

                                <div className="absolute top-4 left-4 flex gap-1">
                                    <div className="px-2 py-1 text-xs font-retro text-primary border border-primary/50 bg-primary/10 rounded animate-pulse">
                                        LIVE FEED
                                    </div>
                                </div>

                                {/* NEWS TICKER */}
                                {latestNews && (
                                    <NewsTicker headline={latestNews.headline} type={latestNews.sentiment} />
                                )}
                            </Card>

                            {/* Bottom Panel */}
                            <div className="h-48 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Card className="p-3 bg-surface flex flex-col border-primary/30">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-retro text-xs text-secondary uppercase tracking-wider">AI Analyst</h3>
                                        <button onClick={getInsight} className="text-xs font-retro text-primary hover:text-white transition-colors">
                                            {analystLoading ? 'SCANNING...' : '[ UPDATE ]'}
                                        </button>
                                    </div>
                                    <div className="bg-background/50 p-3 rounded border border-border text-sm font-mono text-green-400 leading-relaxed overflow-y-auto flex-1 shadow-inner">
                                        <span className="animate-pulse">_ </span>{analystMsg}
                                    </div>
                                </Card>
                                <Card className="p-0 bg-surface overflow-hidden flex flex-col border-primary/30">
                                    <div className="p-2 border-b border-border bg-gray-900/50 flex justify-between items-center">
                                        <h3 className="font-retro text-xs text-secondary uppercase">Recent Logs</h3>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2">
                                        <table className="w-full text-sm font-mono">
                                            <thead className="text-textSecondary text-left">
                                                <tr>
                                                    <th className="pb-2">TIME</th>
                                                    <th className="pb-2">ASSET</th>
                                                    <th className="pb-2">PRICE</th>
                                                    <th className="pb-2 text-right">AMT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trades.map(t => (
                                                    <tr key={t.id} className="border-b border-gray-800/30 hover:bg-white/5">
                                                        <td className="py-1 text-gray-500">{new Date(t.time).toLocaleTimeString()}</td>
                                                        <td className={t.asset === 'SCAM' ? 'text-secondary' : 'text-primary'}>
                                                            {t.asset} {t.leverage && t.leverage > 1 ? <span className="text-[10px] text-danger">x{t.leverage}</span> : ''}
                                                        </td>
                                                        <td className={t.type === 'BUY' ? 'text-success' : 'text-danger'}>
                                                            {t.price.toFixed(t.asset === 'SCAM' ? 4 : 0)}
                                                        </td>
                                                        <td className="text-right text-gray-300">{t.amount.toFixed(4)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column: Order Book & Trading */}
                        <div className="lg:col-span-3 flex flex-col gap-2">
                            <Card className="flex-1 bg-surface flex flex-col min-h-[300px] border-secondary/30">
                                <div className="p-2 border-b border-border bg-secondary/5">
                                    <h3 className="text-xs font-retro text-secondary uppercase text-center">Order Book</h3>
                                </div>
                                <div className="flex-1 flex flex-col text-sm font-mono">
                                    <div className="flex-1 flex flex-col justify-end overflow-hidden pb-1">
                                        {orderBook.asks.map((ask, i) => (
                                            <div key={i} className="flex justify-between px-2 py-[1px] hover:bg-white/5 cursor-pointer relative">
                                                <span className="text-danger z-10">{ask.price.toFixed(2)}</span>
                                                <span className="text-gray-500 z-10">{ask.amount.toFixed(4)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="py-2 px-2 text-center text-xl font-bold border-y-2 border-border bg-background my-1 text-white shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                        {currentCandle.close.toFixed(2)}
                                    </div>

                                    <div className="flex-1 overflow-hidden pt-1">
                                        {orderBook.bids.map((bid, i) => (
                                            <div key={i} className="flex justify-between px-2 py-[1px] hover:bg-white/5 cursor-pointer relative">
                                                <span className="text-success z-10">{bid.price.toFixed(2)}</span>
                                                <span className="text-gray-500 z-10">{bid.amount.toFixed(4)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-surface p-4 border-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
                                <TradingTerminal
                                    currentPrice={currentCandle.close}
                                    portfolio={portfolio}
                                    onTrade={handleTrade}
                                />
                            </Card>
                        </div>
                    </>
                ) : (
                    /* DEX MODE LAYOUT */
                    <div className="col-span-12 flex flex-col md:flex-row gap-4 h-full relative">
                        <div className="absolute inset-0 bg-secondary/5 blur-3xl -z-10 pointer-events-none"></div>

                        {/* Chart for Scam Coin */}
                        <Card className="flex-1 bg-surface/50 border-secondary/50 p-4 relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-retro text-secondary text-lg">SCAM/USD <span className="text-xs text-white bg-danger px-2 rounded ml-2 animate-pulse">HIGH RISK</span></h3>
                                <div className="text-2xl font-mono text-white">${scamPrice.toFixed(4)}</div>
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                                <LineChart data={scamHistory}>
                                    <CartesianGrid stroke="#b026ff" strokeDasharray="3 3" opacity={0.2} />
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Line
                                        type="stepAfter"
                                        dataKey="price"
                                        stroke="#b026ff"
                                        strokeWidth={3}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-400">
                                WARNING: Contract is unverified. Rug pull probability detected.
                            </div>
                        </Card>

                        {/* Swap UI */}
                        <div className="w-full md:w-[450px]">
                            <DexSwap
                                scamPrice={scamPrice}
                                portfolio={portfolio}
                                onSwap={handleDexSwap}
                            />
                        </div>
                    </div>
                )}

                {/* Wallet Modal */}
                <Modal isOpen={showWallet} onClose={() => setShowWallet(false)} title="PLAYER WALLET">
                    <div className="flex flex-col gap-6 font-mono">
                        <div className="text-center py-4 border-b border-border">
                            <div className="text-xs text-textSecondary mb-1 font-retro">ESTIMATED VALUE</div>
                            <div className="text-4xl font-bold text-white tracking-tighter drop-shadow-lg">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-green-900/50 text-green-400 flex items-center justify-center font-bold border border-green-500 rounded">$</div>
                                    <div>
                                        <div className="font-bold text-white">USD (FREE)</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-orange-900/50 text-orange-400 flex items-center justify-center font-bold border border-orange-500 rounded">₿</div>
                                    <div>
                                        <div className="font-bold text-white">BTC</div>
                                        {portfolio.leverage > 1 && <div className="text-[10px] text-danger animate-pulse">LEVERAGED {portfolio.leverage}X</div>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{portfolio.btc.toFixed(6)}</div>
                                    <div className="text-xs text-textSecondary">≈ ${(portfolio.btc * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-purple-900/50 text-purple-400 flex items-center justify-center font-bold border border-purple-500 rounded">S</div>
                                    <div>
                                        <div className="font-bold text-white">SCAM</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{portfolio.scam.toFixed(2)}</div>
                                    <div className="text-xs text-textSecondary">≈ ${(portfolio.scam * scamPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background rounded p-4 border border-border">
                            <h4 className="text-xs font-retro text-secondary uppercase mb-3">Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-textSecondary mb-1">ENTRY PRICE</div>
                                    <div className="font-mono text-sm">${portfolio.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-textSecondary mb-1">BTC PnL</div>
                                    <div className={`font-mono text-sm ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ({pnlPercent.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Game Over Modal */}
                <Modal isOpen={gameOver} onClose={() => onComplete(totalBalance)} title="SESSION COMPLETE">
                    <div className="text-center p-6 flex flex-col items-center gap-6">
                        <div className="font-retro text-4xl text-primary animate-pulse">GAME OVER</div>

                        <div className="w-full bg-background p-6 rounded border-2 border-secondary">
                            <div className="text-sm text-textSecondary font-retro mb-2">FINAL EQUITY</div>
                            <div className="text-5xl font-mono font-bold text-white mb-4">
                                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>

                            <div className="flex justify-between items-center text-sm font-mono border-t border-gray-800 pt-4">
                                <span>STARTING CASH:</span>
                                <span>${INITIAL_CASH.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-mono pt-2">
                                <span>NET PROFIT:</span>
                                <span className={totalBalance >= INITIAL_CASH ? 'text-success' : 'text-danger'}>
                                    {totalBalance >= INITIAL_CASH ? '+' : '-'}${Math.abs(totalBalance - INITIAL_CASH).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <Button onClick={() => onComplete(totalBalance)} variant="primary" size="lg" className="w-full">
                            CONTINUE
                        </Button>
                    </div>
                </Modal>

            </main>
        </div>
    );
};

export default App;
