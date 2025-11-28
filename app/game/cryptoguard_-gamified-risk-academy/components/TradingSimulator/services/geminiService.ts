import { GoogleGenAI } from "@google/genai";
import type { Portfolio, RiskMetrics, Candle } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getAnalystInsight = async (
  portfolio: Portfolio,
  recentCandles: Candle[]
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Connect API Key for AI Insights.";

  const lastPrice = recentCandles[recentCandles.length - 1].close;
  const startPrice = recentCandles[0].close;
  const trend = lastPrice > startPrice ? "Upward" : "Downward";

  const prompt = `
    You are a professional Senior Crypto Market Analyst at a major institutional desk.
    Analyze the current market situation and the user's portfolio.
    
    Data:
    - Current BTC Price: $${lastPrice.toFixed(2)}
    - Trend (last 60 periods): ${trend}
    - User Portfolio: $${(portfolio.cash + portfolio.btc * lastPrice).toFixed(2)}
    - Cash Position: ${(portfolio.cash / (portfolio.cash + portfolio.btc * lastPrice) * 100).toFixed(1)}%
    
    Provide a brief, professional, 2-sentence market insight and a recommendation. 
    Use professional tone (e.g., "Market structure indicates...", "Consider rebalancing...").
    Do not use slang or arcade terms.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Market data unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analyst unavailable.";
  }
};