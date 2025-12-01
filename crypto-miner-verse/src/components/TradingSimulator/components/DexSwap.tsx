import React, { useState, useEffect } from 'react';
import { Button, Card } from './RetroComponents';
import type { Portfolio } from '../types';

interface Props {
  scamPrice: number;
  portfolio: Portfolio;
  onSwap: (type: 'BUY' | 'SELL', amountUSD: number) => void;
}

export const DexSwap: React.FC<Props> = ({ scamPrice, portfolio, onSwap }) => {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isBuy, setIsBuy] = useState(true); // True = USD -> SCAM, False = SCAM -> USD
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  // Auto-calculate receive amount
  useEffect(() => {
    const pay = parseFloat(payAmount) || 0;
    if (pay === 0) {
      setReceiveAmount('');
      return;
    }

    // Simple XYK Simulation: Price impact + 0.3% fee + Gas
    const gasFee = 50; // Flat $50 gas
    const netPay = Math.max(0, pay - gasFee);

    if (isBuy) {
      // Buying SCAM with USD
      setReceiveAmount((netPay / scamPrice).toFixed(2));
    } else {
      // Selling SCAM for USD
      // For selling, we just treat payAmount as SCAM units
      setReceiveAmount(((pay * scamPrice) - gasFee).toFixed(2));
    }
  }, [payAmount, isBuy, scamPrice]);

  const handleFlip = () => {
    setIsBuy(!isBuy);
    setPayAmount('');
    setReceiveAmount('');
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      // Random risk score 0-100
      setRiskScore(Math.floor(Math.random() * 100));
      setScanning(false);
    }, 1500);
  };

  const executeSwap = () => {
    const val = parseFloat(payAmount);
    if (!val || val <= 0) return;

    if (isBuy) {
      // Validation handled by parent usually, but good to check
      if (val > portfolio.cash) return;
      onSwap('BUY', val);
    } else {
      if (val > portfolio.scam) return;
      // Logic trick: pass the USD value of the SCAM being sold
      onSwap('SELL', val * scamPrice);
    }
    setPayAmount('');
    setRiskScore(null);
  };

  const riskColor = riskScore && riskScore > 80 ? 'text-danger' : riskScore && riskScore > 50 ? 'text-orange-400' : 'text-success';
  const riskLabel = riskScore && riskScore > 80 ? 'CRITICAL RISK' : riskScore && riskScore > 50 ? 'SUSPICIOUS' : 'AUDITED SAFE';

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/20 rounded-full blur-[80px] animate-pulse delay-1000"></div>

      <Card className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl relative z-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-sans font-semibold text-lg">Swap</span>
            <div className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-[10px] text-secondary font-mono">
              V3 POOL
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        {/* Input: Pay */}
        <div className="bg-black/40 rounded-2xl p-4 mb-1 border border-transparent focus-within:border-secondary/50 transition-colors">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>You pay</span>
            <span
              className="text-primary cursor-pointer hover:underline"
              onClick={() => isBuy ? setPayAmount(portfolio.cash.toFixed(2)) : setPayAmount(portfolio.scam.toString())}
            >
              Balance: {isBuy ? `$${portfolio.cash.toFixed(0)}` : portfolio.scam.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              placeholder="0"
              className="bg-transparent text-4xl text-white outline-none w-2/3 font-sans placeholder-gray-700"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-gray-700 hover:border-gray-500 cursor-pointer">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isBuy ? 'bg-green-500' : 'bg-pink-500'}`}>
                {isBuy ? '$' : 'S'}
              </div>
              <span className="font-bold text-white">{isBuy ? 'USD' : 'SCAM'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2 4L6 8L10 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            ≈ ${isBuy ? payAmount || '0.00' : ((parseFloat(payAmount) || 0) * scamPrice).toFixed(2)}
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="relative h-4 flex items-center justify-center z-10">
          <button
            onClick={handleFlip}
            className="bg-surface border-4 border-background rounded-xl p-2 hover:scale-110 transition-transform cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>

        {/* Input: Receive */}
        <div className="bg-black/40 rounded-2xl p-4 mt-1 border border-transparent">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>You receive</span>
            <span className="text-gray-500">
              Balance: {isBuy ? portfolio.scam.toFixed(4) : `$${portfolio.cash.toFixed(0)}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              readOnly
              placeholder="0"
              className="bg-transparent text-4xl text-gray-300 outline-none w-2/3 font-sans"
              value={receiveAmount}
            />
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-gray-700 hover:border-gray-500 cursor-pointer">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${!isBuy ? 'bg-green-500' : 'bg-pink-500'}`}>
                {!isBuy ? '$' : 'S'}
              </div>
              <span className="font-bold text-white">{!isBuy ? 'USD' : 'SCAM'}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2 4L6 8L10 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Network Cost: <span className="text-orange-500">$50.00</span>
          </div>
        </div>

        {/* Risk Scanner */}
        <div className="my-4">
          {!riskScore ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="w-full py-2 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-retro hover:bg-blue-900/50 flex items-center justify-center gap-2 transition-all"
            >
              {scanning ? (
                <>SCANNING CONTRACT...</>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  RUN AI AUDIT (FREE)
                </>
              )}
            </button>
          ) : (
            <div className={`w-full py-2 rounded-xl border flex items-center justify-center gap-2 font-bold font-retro text-xs ${riskScore > 50 ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
              <span className={riskColor}>SCORE: {riskScore}/100</span>
              <span className="text-gray-400">|</span>
              <span className={riskColor}>{riskLabel}</span>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={executeSwap}
          disabled={!payAmount}
          className="w-full py-4 mt-2 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xl shadow-[0_0_20px_rgba(176,38,255,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
        >
          {isBuy ? 'Swap USD to SCAM' : 'Swap SCAM to USD'}
        </button>

      </Card>

      <div className="mt-6 text-center">
        <h3 className="text-white font-retro text-xs mb-1">DEX METRICS</h3>
        <div className="flex gap-4 text-[10px] font-mono text-gray-500 bg-black/50 px-4 py-2 rounded-full border border-gray-800">
          <span>TVL: $420,069</span>
          <span>24H VOL: $1.2M</span>
          <span>SCAM PRICE: ${scamPrice.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};