import type { Candle, Portfolio, RiskMetrics, OrderBookItem, NewsItem } from '../types';

// Generate initial history of candles (e.g. 1 hour of 1-minute candles)
export const generateInitialMarket = (count: number): Candle[] => {
  const data: Candle[] = [];
  let price = 42000; // Retro starting price point

  const now = Date.now();
  const ONE_MINUTE = 60 * 1000;

  for (let i = count; i > 0; i--) {
    const time = now - (i * ONE_MINUTE);
    const volatility = price * 0.003;

    const open = price;
    const change = (Math.random() - 0.45) * volatility; // Slight upward bias initially
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

// Return both candle and potential news event
export const generateNextTick = (prev: Candle): { candle: Candle, news: NewsItem | null } => {
  const ONE_MINUTE = 60 * 1000;
  const nextTime = prev.time + ONE_MINUTE;

  // 5% Chance of a "Flash Crash" (Sharp Fall)
  const isCrash = Math.random() < 0.05;
  // 10% Chance of a "Pump" (Sharp Rise)
  const isPump = Math.random() < 0.10;

  let change = 0;
  let volatility = prev.close * 0.002;
  let news: NewsItem | null = null;

  if (isCrash) {
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
    change = (Math.random() - 0.4) * volatility;
    // Small chance of neutral news
    if (Math.random() < 0.1) news = generateNews('NEUTRAL');
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
  "Bitcoin Hashrate Hits All-Time High"
];

const NEGATIVE_HEADLINES = [
  "China Announces New Crypto Ban",
  "Major Exchange Hacked: 10k BTC Stolen",
  "Fed Hikes Interest Rates by 0.75%",
  "Tether De-pegs to $0.98",
  "SEC Sues Major Celebrity for Shilling",
  "Bitcoin Miners Capitulating"
];

const NEUTRAL_HEADLINES = [
  "Market Consolidation Continues",
  "Whale Alert: 500 BTC Moved to Cold Storage",
  "Crypto Regulation Bills Stalled in Congress",
  "Trading Volume Low on Weekends",
  "Analyst Predicts 'Crab Market'"
];

const generateNews = (sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'): NewsItem => {
  let headlines = NEUTRAL_HEADLINES;
  if (sentiment === 'POSITIVE') headlines = POSITIVE_HEADLINES;
  if (sentiment === 'NEGATIVE') headlines = NEGATIVE_HEADLINES;

  const text = headlines[Math.floor(Math.random() * headlines.length)];

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
