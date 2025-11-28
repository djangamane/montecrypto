import React, { useState, useEffect } from 'react';
import { Button, TabButton } from './RetroComponents';
import type { Portfolio } from '../types';

interface Props {
    currentPrice: number;
    portfolio: Portfolio;
    onTrade: (type: 'BUY' | 'SELL', amount: number, leverage: number) => void;
}

export const TradingTerminal: React.FC<Props> = ({ currentPrice, portfolio, onTrade }) => {
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [amountUSD, setAmountUSD] = useState<string>('');
    const [amountBTC, setAmountBTC] = useState<string>('');
    const [inputMode, setInputMode] = useState<'USD' | 'BTC'>('USD');
    const [leverage, setLeverage] = useState<number>(1);

    // Sync inputs
    useEffect(() => {
        if (!amountUSD && !amountBTC) return;

        if (inputMode === 'USD') {
            const usd = parseFloat(amountUSD) || 0;
            // With leverage, you buy more BTC with same USD
            // But usually inputs show "Collateral" vs "Position Size"
            // Let's keep it simple: You input COLLATERAL USD.
            // BTC Amount = (Collateral * Leverage) / Price
            const btc = (usd * leverage) / currentPrice;
            setAmountBTC(usd > 0 ? btc.toFixed(8) : '');
        } else {
            const btc = parseFloat(amountBTC) || 0;
            const usd = (btc * currentPrice) / leverage;
            setAmountUSD(btc > 0 ? usd.toFixed(2) : '');
        }
    }, [amountUSD, amountBTC, currentPrice, inputMode, leverage]);

    const handleTrade = () => {
        const btcAmount = parseFloat(amountBTC);
        if (btcAmount > 0) {
            onTrade(side, btcAmount, leverage);
            setAmountBTC('');
            setAmountUSD('');
            setLeverage(1); // Reset leverage after trade for safety
        }
    };

    const maxBuy = portfolio.cash;
    const maxSell = portfolio.btc;

    const availableLabel = side === 'BUY' ? 'MAX COLLATERAL' : 'MAX SELL';
    const availableValue = side === 'BUY'
        ? `$${maxBuy.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : `${maxSell.toFixed(8)} BTC`;

    // Liquidation Price Calc (Estimated for next trade)
    let liquidationPrice = 0;
    if (side === 'BUY' && leverage > 1 && currentPrice > 0) {
        // Liq = Entry * (1 - 1/Leverage)
        liquidationPrice = currentPrice * (1 - (1 / leverage) + 0.005); // 0.005 buffer
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b border-gray-700 mb-4">
                <TabButton active={side === 'BUY'} onClick={() => setSide('BUY')}>Buy</TabButton>
                <TabButton active={side === 'SELL'} onClick={() => setSide('SELL')}>Sell</TabButton>
            </div>

            <div className="flex flex-col gap-4">
                {/* Available Balance */}
                <div className="bg-black/30 p-2 rounded border border-dashed border-gray-600 flex justify-between items-center text-xs font-mono">
                    <span className="text-textSecondary">{availableLabel}</span>
                    <span className="font-bold text-primary">{availableValue}</span>
                </div>

                {/* Leverage Selector */}
                {side === 'BUY' && (
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-retro text-textSecondary">LEVERAGE (MULTIPLIER)</span>
                        <div className="flex gap-1">
                            {[1, 5, 20, 50].map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLeverage(l)}
                                    className={`flex-1 py-1 text-xs font-bold font-mono border rounded transition-all ${leverage === l
                                            ? 'bg-secondary text-white border-secondary shadow-[0_0_10px_rgba(176,38,255,0.4)]'
                                            : 'bg-black text-gray-500 border-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    {l}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inputs */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-textSecondary mb-1 font-retro">
                            <span>USD COLLATERAL</span>
                            <span className="cursor-pointer hover:text-white text-primary" onClick={() => {
                                setInputMode('USD');
                                setAmountUSD(side === 'BUY' ? maxBuy.toFixed(2) : (maxSell * currentPrice / leverage).toFixed(2));
                            }}>
                                [MAX]
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amountUSD}
                                onChange={(e) => {
                                    setInputMode('USD');
                                    setAmountUSD(e.target.value);
                                }}
                                className="w-full bg-black border border-gray-700 rounded p-3 text-lg font-mono focus:border-primary focus:outline-none text-white transition-colors placeholder-gray-800"
                                placeholder="0.00"
                            />
                            <span className="absolute right-3 top-4 text-xs text-gray-500 font-bold">USD</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-textSecondary mb-1 font-retro">
                            <span>BTC POSITION SIZE</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amountBTC}
                                onChange={(e) => {
                                    setInputMode('BTC');
                                    setAmountBTC(e.target.value);
                                }}
                                className="w-full bg-black border border-gray-700 rounded p-3 text-lg font-mono focus:border-primary focus:outline-none text-white transition-colors placeholder-gray-800"
                                placeholder="0.00"
                            />
                            <span className="absolute right-3 top-4 text-xs text-gray-500 font-bold">BTC</span>
                        </div>
                    </div>
                </div>

                {/* Summary & Risk */}
                <div className="bg-surface p-3 rounded text-xs space-y-2 mt-2 border border-border/50 font-mono">
                    <div className="flex justify-between font-bold text-sm text-white">
                        <span>TOTAL POS SIZE</span>
                        <span>${((parseFloat(amountUSD) || 0) * leverage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {leverage > 1 && side === 'BUY' && (
                        <div className="flex justify-between font-bold text-danger border-t border-gray-700 pt-2 animate-pulse">
                            <span>LIQUIDATION PRICE</span>
                            <span>${liquidationPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    )}
                </div>

                <Button
                    variant={side === 'BUY' ? 'success' : 'danger'}
                    fullWidth
                    onClick={handleTrade}
                >
                    {side} BTC {leverage > 1 && `${leverage}x`}
                </Button>
            </div>
        </div>
    );
};
