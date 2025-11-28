import type { Candle, Portfolio, RiskMetrics, OrderBookItem, NewsItem } from '../types';

// Generate initial history of candles (e.g. 1 hour of 1-minute candles)
export const generateInitialMarket = (count: number): Candle[] => {
  const data: Candle[] = [];
  const startBand = [25000, 60000];
  let price = startBand[0] + Math.random() * (startBand[1] - startBand[0]); // Random start each session

  const now = Date.now();
  const ONE_MINUTE = 60 * 1000;

  for (let i = count; i > 0; i--) {
    const time = now - (i * ONE_MINUTE);
    const baseVol = 0.0015 + Math.random() * 0.0015; // 0.15% - 0.3% baseline
    const volatility = price * baseVol;

    const open = price;
    const drift = (Math.random() - 0.5) * volatility;
    const bias = Math.random() < 0.5 ? -0.2 : 0.2;
    const change = drift + bias * volatility; // small bias random
    const close = open + change;

    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);

    const volume = Math.random() * 50 + 10;

    data.push({
      time,
      dateStr: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      volume
    });

    price = close;
  }
  return data;
};

type Regime = 'BULL' | 'BEAR' | 'CHOP';
let currentRegime: Regime = Math.random() < 0.33 ? 'BEAR' : Math.random() < 0.5 ? 'CHOP' : 'BULL';
let ticksInRegime = 0;
const regimeDurationTarget = () => 30 + Math.floor(Math.random() * 40); // 30-70 ticks

const maybeShiftRegime = () => {
  ticksInRegime++;
  const limit = regimeDurationTarget();
  if (ticksInRegime > limit || Math.random() < 0.05) {
    // shift regimes
    const roll = Math.random();
    if (currentRegime === 'BULL') currentRegime = roll < 0.5 ? 'CHOP' : 'BEAR';
    else if (currentRegime === 'BEAR') currentRegime = roll < 0.5 ? 'CHOP' : 'BULL';
    else currentRegime = roll < 0.5 ? 'BULL' : 'BEAR';
    ticksInRegime = 0;
  }
};

// Return both candle and potential news event
export const generateNextTick = (prev: Candle): { candle: Candle, news: NewsItem | null } => {
  maybeShiftRegime();
  const ONE_MINUTE = 60 * 1000;
  const nextTime = prev.time + ONE_MINUTE;

  // Regime-based probabilities
  const baseVol = prev.close * 0.002;
  const regimeVolMult = currentRegime === 'BULL' ? 1.2 : currentRegime === 'BEAR' ? 1.6 : 1.0;

  // Event odds
  const crashOdds = currentRegime === 'BEAR' ? 0.08 : currentRegime === 'CHOP' ? 0.05 : 0.03;
  const pumpOdds = currentRegime === 'BULL' ? 0.15 : currentRegime === 'CHOP' ? 0.10 : 0.05;

  const isCrash = Math.random() < crashOdds;
  const isPump = Math.random() < pumpOdds;

  // Rare surprise events (once in a while)
  const rareRoll = Math.random();
  let rareEvent: 'ETF_MEGA' | 'EXCHANGE_HACK' | null = null;
  if (rareRoll < 0.01) {
    rareEvent = rareRoll < 0.005 ? 'ETF_MEGA' : 'EXCHANGE_HACK';
  }

  let change = 0;
  let volatility = baseVol * regimeVolMult;
  let news: NewsItem | null = null;

  if (rareEvent === 'ETF_MEGA') {
    change = prev.close * (0.04 + Math.random() * 0.03); // +4% to +7%
    volatility *= 6;
    news = generateNews('POSITIVE', 'ETF Mega Pump: Institutions Flood In');
  } else if (rareEvent === 'EXCHANGE_HACK') {
    change = -(prev.close * (0.05 + Math.random() * 0.05)); // -5% to -10%
    volatility *= 6;
    news = generateNews('NEGATIVE', 'Major Exchange Hack: Liquidity Shock');
  } else if (isCrash) {
    // Sharp Fall
    change = -(prev.close * (0.02 + Math.random() * 0.03)); // Drop 2-5%
    volatility *= 5; // High volatility during crash
    news = generateNews('NEGATIVE');
  } else if (isPump) {
    // Moderate/Sharp Rise
    change = prev.close * (0.01 + Math.random() * 0.015);
    news = generateNews('POSITIVE');
  } else {
    // Moderate Rise (Grind up)
    const bias = currentRegime === 'BULL' ? 0.1 : currentRegime === 'BEAR' ? -0.1 : 0;
    change = (Math.random() - 0.4 + bias) * volatility;
    // Small chance of neutral news
    if (Math.random() < 0.2) news = generateNews('NEUTRAL');
  }

  const open = prev.close;
  const close = open + change;

  // Wicks
  const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
  const low = Math.min(open, close) - Math.random() * (volatility * 0.3);

  const candle = {
    time: nextTime,
    dateStr: new Date(nextTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    open,
    high,
    low,
    close,
    volume: Math.random() * 100 + (isCrash ? 200 : 20)
  };

  return { candle, news };
};

export const generateNextCandle = (prev: Candle): Candle => {
  return generateNextTick(prev).candle;
};

// News Headlines Database
const POSITIVE_HEADLINES = [
  "SEC Approves Bitcoin ETF Applications",
  "Elon Musk Tweets: 'Bitcoin is King'",
  "Fed Announces Rate Cuts",
  "MicroStrategy Buys Another 1000 BTC",
  "Amazon Rumored to Accept Crypto",
  "Bitcoin Hashrate Hits All-Time High",
  "Sovereign Wealth Fund Discloses BTC Position",
  "Nation-State Announces BTC Mining Initiative",
  "Visa Launches BTC Rewards Program",
  "ETF Inflows Hit Record High"
];

const NEGATIVE_HEADLINES = [
  "China Announces New Crypto Ban",
  "Major Exchange Hacked: 10k BTC Stolen",
  "Fed Hikes Interest Rates by 0.75%",
  "Tether De-pegs to $0.98",
  "SEC Sues Major Celebrity for Shilling",
  "Bitcoin Miners Capitulating",
  "Whale Dumps 5k BTC on Market",
  "Celsius Liquidation Fears Resurface",
  "Stablecoin Loses Peg Intraday",
  "Regulator Warns of Leverage Crackdown"
];

const NEUTRAL_HEADLINES = [
  "Market Consolidation Continues",
  "Whale Alert: 500 BTC Moved to Cold Storage",
  "Crypto Regulation Bills Stalled in Congress",
  "Trading Volume Low on Weekends",
  "Analyst Predicts 'Crab Market'",
  "Sideways Chop Persists",
  "ETF Applications Under Review",
  "Hashrate Stable; Difficulty Adjusts Slightly",
  "OTC Desks Report Balanced Flows",
  "Volatility Index Near Monthly Average"
];

const generateNews = (sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL', custom?: string): NewsItem => {
  let headlines = NEUTRAL_HEADLINES;
  if (sentiment === 'POSITIVE') headlines = POSITIVE_HEADLINES;
  if (sentiment === 'NEGATIVE') headlines = NEGATIVE_HEADLINES;

  const text = custom || headlines[Math.floor(Math.random() * headlines.length)];

  return {
    id: Date.now(),
    headline: text,
    sentiment,
    time: Date.now()
  };
};

// SCAM Token Logic: Extreme Volatility
export const generateNextScamPrice = (currentPrice: number): number => {
  // 2% Chance of Rug Pull (99% drop)
  if (Math.random() < 0.02) return currentPrice * 0.01;

  // 10% Chance of Moon (50% pump)
  if (Math.random() < 0.10) return currentPrice * 1.5;

  // General Chaos (-20% to +20%)
  const change = (Math.random() - 0.5) * 0.4;
  return Math.max(0.0001, currentPrice * (1 + change));
};

export const generateOrderBook = (currentPrice: number): { bids: OrderBookItem[], asks: OrderBookItem[] } => {
  const bids: OrderBookItem[] = [];
  const asks: OrderBookItem[] = [];

  // Generate Asks (Sellers) > Current Price
  let currentAsk = currentPrice;
  for (let i = 0; i < 12; i++) {
    currentAsk += Math.random() * 10 + 2;
    const amount = Math.random() * 1.5;
    asks.push({ price: currentAsk, amount, total: amount * currentAsk });
  }

  // Generate Bids (Buyers) < Current Price
  let currentBid = currentPrice;
  for (let i = 0; i < 12; i++) {
    currentBid -= Math.random() * 10 + 2;
    const amount = Math.random() * 1.5;
    bids.push({ price: currentBid, amount, total: amount * currentBid });
  }

  return { bids, asks: asks.reverse() };
};

export const getPortfolioValue = (p: Portfolio, currentPrice: number, scamPrice: number = 0) => {
  return p.cash + (p.btc * currentPrice) + (p.scam * scamPrice);
};
