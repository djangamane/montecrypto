import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

// Initialize Gemini Client (Next build friendly)
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeCryptoRisk = async (scenario: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    // Mock response if no API key is present for demo purposes
    console.warn("No API Key found. Returning mock data.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          score: 85,
          reasoning: "Mock Analysis: The scenario describes a token with high social hype but anonymous developers and unlocked liquidity. This fits the pattern of a 'Rug Pull'.",
          signals: ["Anonymous Team", "Unlocked Liquidity", "Artificial Hype Spike"]
        });
      }, 1500);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following crypto scenario for risk. Act as a senior security auditor.
      
      Scenario: "${scenario}"
      
      Provide a JSON response with:
      - score: integer 0-100 (0 is safe, 100 is definite scam)
      - reasoning: a concise explanation (max 2 sentences)
      - signals: array of strings listing key risk flags found.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
            signals: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 50,
      reasoning: "Could not perform deep analysis due to connection error. Treat with caution.",
      signals: ["Analysis Failed"]
    };
  }
};
