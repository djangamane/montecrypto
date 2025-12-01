export enum AssetType {
  BTC = 'BTC',
  USD = 'USD',
  SCAM = 'SCAM'
}

export enum SimulationMode {
  BACKTEST = 'BACKTEST',
  PAPER_TRADING = 'PAPER_TRADING'
}

export interface Candle {
  time: number;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Portfolio {
  cash: number;
  btc: number;
  scam: number;
  avgBuyPrice: number;
  leverage: number;
  liquidationPrice: number;
  history: {
    time: number;
    totalValue: number;
  }[];
}

export interface TradeLog {
  id: string;
  time: number;
  type: 'BUY' | 'SELL';
  asset: AssetType;
  amount: number;
  price: number;
  total: number;
  leverage?: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
}

export interface OrderBookItem {
  price: number;
  amount: number;
  total: number;
}

export interface NewsItem {
  id: number;
  headline: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  time: number;
}
