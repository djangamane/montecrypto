import { GoogleGenAI } from "@google/genai";
import { BlogInput } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBlogPost(input: BlogInput): Promise<string> {
  // Fields required for a quality prompt. Slug and PublishDate are handled later.
  const requiredFields: (keyof BlogInput)[] = ['title', 'category', 'keywords', 'summary'];
  
  for (const field of requiredFields) {
    if (!input[field] || (input[field] as string).trim() === '') {
      return `MISSING DATA: ${field}`;
    }
  }

  const prompt = `
You are an editor for AI Crypto Risk (https://aicryptorisk.com).  
We publish one SEO-optimized blog post per day using current crypto/AI risk intelligence.

Use the structured input provided and follow these rules exactly:

Inputs (from CSV):
- title: ${input.title}
- category: ${input.category}
- keywords: ${input.keywords}
- summary: ${input.summary}
- slug: ${input.slug || 'auto-generated-from-title'}
- publishDate: ${input.publishDate || 'not-set'}

Your task:
1. Produce a fresh blog post for AI Crypto Risk using credible sources.
   • Pull recent (≤ 6 months) examples, stats, or case studies from crypto/AI/fintech/security sources.  
   • Mention any relevant scams, rug pulls, regulatory actions, or AI tooling tied to the topic.
2. SEO optimization:
   • Treat the first keyword in \`keywords\` as the primary target phrase. Use it in the main title, introduction, at least two H2/H3 headings, and in the closing paragraph.  
   • Naturally weave 2–3 variations from the remaining keywords.
3. Structure and tone:
   • Output must be valid Markdown.
   • Include a short intro, clearly labeled H2/H3 sections, at least one bullet or numbered list, and a strong conclusion.
   • Tone: authoritative, evidence‑based, but accessible. Educational, not promotional.
4. Call to action:
   • End the post with the line: **“Before you buy, paste a contract into our AI Crypto Risk tool to scan for red flags.”**
5. Output:
   • Return only the finished Markdown. No explanations, system text, or meta commentary.
`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    throw new Error("Failed to generate blog post. Please check the API key and network connection.");
  }
}
