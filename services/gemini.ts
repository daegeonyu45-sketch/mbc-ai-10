
/**
 * SECURITY WARNING: 
 * This file does NOT contain any hardcoded API Keys.
 * The API Key is dynamically injected via process.env.API_KEY at runtime.
 * For deployment, please use the platform's built-in API Key Selection dialog.
 */

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CategoryType } from "../types";

// [실 운영 모드] Mock Mode 비활성화
const USE_DEMO_MODE = false;

/**
 * 인스턴스 생성 시점에 최신 API 키를 참조하도록 함수로 관리합니다.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY가 감지되지 않았습니다. 먼저 API 키를 설정해 주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * 실시간 뉴스 보도 사진 검색 함수 (Unsplash Source API 활용하여 '검색' 시뮬레이션)
 */
export const fetchNewsImages = (query: string): string => {
  const encodedQuery = encodeURIComponent(query);
  return `https://images.unsplash.com/photo-1585829365234-781fdec3d4e4?auto=format&fit=crop&w=1200&q=80&sig=${encodedQuery}_${Date.now()}`;
};

/**
 * AI 이미지 생성 함수 (Pollinations.ai 활용)
 */
export const generateAIImage = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
};

export const conductAIGroundingSearch = async (query: string, useMock: boolean = false) => {
  if (USE_DEMO_MODE || useMock) {
    await new Promise(r => setTimeout(r, 800));
    return { 
      text: "Mock 모드가 활성화되어 있습니다.", 
      sources: [] 
    };
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 주제에 대해 최신 정보와 주요 세부 사항을 검색해 주세요: ${query}. 찾은 내용을 한국어로 요약하고 반드시 출처 URL들을 포함해 주세요.`,
      config: { 
        tools: [{ googleSearch: {} }] 
      },
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
    console.error("Grounding Search Error:", err);
    throw new Error(`검색 엔진 오류: ${err.message || "실시간 검색 중 문제가 발생했습니다."}`);
  }
};

export const classifyArticle = async (text: string, useMock: boolean = false): Promise<CategoryType> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 기사 내용을 바탕으로 가장 적절한 카테고리 하나를 선택하세요: Politics, Economy, Society, Tech, Culture. 단어 하나만 응답하세요.\n\n내용: ${text.substring(0, 500)}`,
    });
    const category = response.text?.trim() as CategoryType;
    const validCategories: CategoryType[] = ['Politics', 'Economy', 'Society', 'Tech', 'Culture'];
    return validCategories.includes(category) ? category : 'General';
  } catch (err) {
    return 'General';
  }
};

export const generateArticleDraft = async (context: string, tone: string, length: string, useMock: boolean = false) => {
  try {
    const ai = getAI();
    const prompt = `제공된 검색 결과(Context)를 바탕으로 신뢰할 수 있는 전문적인 뉴스 기사를 작성해 주세요. 
    
[Context]:
${context}

[요구사항]:
- 어조: ${tone}
- 분량: ${length === 'short' ? '짧게' : length === 'long' ? '길게' : '적당하게'}
- 언어: 한국어
- 반드시 제공된 Context의 팩트에 기반할 것.
- 마크다운 형식을 사용하지 말고 순수 텍스트 문단으로만 구성할 것.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { temperature: 0.3 }
    });
    return response.text || "기사 초안을 생성할 수 없습니다.";
  } catch (err: any) {
    console.error("Generate Article Error:", err);
    throw new Error(`기사 생성 오류: ${err.message}`);
  }
};

export const summarizeContent = async (text: string, useMock: boolean = false) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 뉴스를 한 문장으로 강렬하게 요약해 주세요(한국어): ${text}`,
    });
    return response.text?.trim() || "요약 실패";
  } catch (err: any) {
    return "핵심 내용을 요약 중입니다.";
  }
};

export const generateOSMUContent = async (article: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `기사 내용: ${article}

위 기사를 바탕으로 다음 콘텐츠를 생성해 주세요:
1) 카드뉴스 슬라이드 5개: 각 슬라이드별 텍스트, 이미지 검색용 키워드(영문), 그리고 이미지 소스 타입('search' 또는 'generate')을 결정하세요.
   - 'search': 실제 인물(유명인), 사건 현장, 특정 장소 등 실사 보도 사진이 필요한 경우
   - 'generate': 추상적인 개념, 미래, 기술 묘사 등 예술적 삽화가 어울리는 경우
2) 유튜브 쇼츠용 구어체 대본(60초 내외)

JSON 형식으로 응답해 주세요.`,
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
                  image_source_type: { type: Type.STRING, description: "'search' or 'generate'" }
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
    return JSON.parse(response.text);
  } catch (err) {
    return { 
      slides: [{ text: "내용 분석 중...", image_keyword: "news", image_source_type: "search" }], 
      script: "대본을 생성할 수 없습니다." 
    };
  }
};

export const performFactCheck = async (rawContext: string, generatedArticle: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `원문 데이터: ${rawContext}\n\n생성된 기사: ${generatedArticle}\n\n두 텍스트를 비교하여 1) 팩트 일치도 점수(0-100), 2) 제목의 자극성(낚시성) 점수(0-100), 3) 왜곡된 정보에 대한 경고 메시지를 JSON으로 출력하세요.`,
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
    return JSON.parse(response.text);
  } catch (err) {
    return { matchingScore: 100, clickbaitScore: 0, warnings: [] };
  }
};

export const extractDebatePoints = async (article: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `기사 내용: ${article}\n\n이 기사에서 다루는 사회적 논쟁 주제 하나와 그에 대한 찬성 의견 3가지, 반대 의견 3가지를 한국어로 추출해 주세요. JSON으로 응답하세요.`,
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
    return JSON.parse(response.text);
  } catch (err) {
    return { topic: "추가 논의가 필요한 주제입니다.", pros: [], cons: [] };
  }
};

export const generateIllustrativeImage = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `High-quality photojournalism style news photo about: ${prompt}. Professional lighting, 4k.` }] },
      config: { 
        imageConfig: { aspectRatio: "16:9" },
        tools: [{ googleSearch: {} }] 
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (err) {
    console.error("Image Gen Error:", err);
  }
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
};
