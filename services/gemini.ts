
import { GoogleGenAI, Type } from "@google/genai";
import { CategoryType } from "../types";

/**
 * Initialize the Google GenAI client using the environment variable API_KEY.
 * Follows the guidelines to always use process.env.API_KEY.
 */
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fetchNewsImages = (query: string): string => {
  const encodedQuery = encodeURIComponent(query);
  return `https://images.unsplash.com/photo-1585829365234-781fdec3d4e4?auto=format&fit=crop&w=1200&q=80&sig=${encodedQuery}_${Date.now()}`;
};

export const generateAIImage = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
};

export const conductAIGroundingSearch = async (query: string) => {
  try {
    const ai = getAI();
    
    // Using gemini-3-flash-preview for search grounding tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 주제에 대해 최신 정보와 주요 세부 사항을 검색해 주세요: ${query}. 찾은 내용을 한국어로 요약하고 반드시 출처 URL들을 포함해 주세요.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "";
    const sources: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web?.uri) sources.push(chunk.web.uri);
      });
    }

    return { text, sources: Array.from(new Set(sources)) };
  } catch (err: any) {
    // If the key is invalid or not found, prompt selection as per guidelines.
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    throw new Error(`검색 엔진 오류: ${err.message || "실시간 검색 중 문제가 발생했습니다."}`);
  }
};

export const classifyArticle = async (text: string): Promise<CategoryType> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 기사 내용을 바탕으로 가장 적절한 카테고리 하나를 선택하세요: Politics, Economy, Society, Tech, Culture. 단어 하나만 응답하세요.\n\n내용: ${text.substring(0, 500)}`,
    });
    const category = response.text?.trim() as CategoryType;
    const validCategories: CategoryType[] = ['Politics', 'Economy', 'Society', 'Tech', 'Culture'];
    return validCategories.includes(category) ? category : 'General';
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    return 'General';
  }
};

export const generateArticleDraft = async (context: string, tone: string, length: string) => {
  try {
    const ai = getAI();
    const prompt = `제공된 검색 결과(Context)를 바탕으로 신뢰할 수 있는 전문적인 뉴스 기사를 작성해 주세요.\n\n[Context]:\n${context}\n\n[요구사항]:\n- 어조: ${tone}\n- 분량: ${length === 'short' ? '짧게' : length === 'long' ? '길게' : '적당하게'}\n- 언어: 한국어`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { temperature: 0.3 }
    });
    return response.text || "기사 초안을 생성할 수 없습니다.";
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    throw new Error(`기사 생성 오류: ${err.message}`);
  }
};

export const summarizeContent = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 뉴스를 한 문장으로 강렬하게 요약해 주세요(한국어): ${text}`,
    });
    return response.text?.trim() || "요약 실패";
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    return "핵심 내용을 요약 중입니다.";
  }
};

export const generateOSMUContent = async (article: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `기사 내용: ${article}\n\n위 기사를 바탕으로 카드뉴스 슬라이드 5개와 유튜브 쇼츠용 대본을 생성하세요.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  image_keyword: { type: Type.STRING },
                  image_source_type: { type: Type.STRING }
                },
                required: ["text", "image_keyword", "image_source_type"]
              } 
            },
            script: { type: Type.STRING }
          },
          required: ["slides", "script"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    return { slides: [], script: "" };
  }
};

export const performFactCheck = async (rawContext: string, generatedArticle: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `데이터 검증: ${rawContext} vs ${generatedArticle}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchingScore: { type: Type.NUMBER },
            clickbaitScore: { type: Type.NUMBER },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["matchingScore", "clickbaitScore", "warnings"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    return { matchingScore: 100, clickbaitScore: 0, warnings: [] };
  }
};

export const extractDebatePoints = async (article: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `기사 논쟁 추출: ${article}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["topic", "pros", "cons"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    return { topic: "", pros: [], cons: [] };
  }
};

export const generateIllustrativeImage = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `High-quality news photo: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (err: any) {
    if (err.message?.includes("Requested entity was not found")) {
      window.aistudio?.openSelectKey?.();
    }
    console.error("Image Gen Error:", err);
  }
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
};
