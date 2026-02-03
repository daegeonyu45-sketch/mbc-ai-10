
export enum WorkflowStatus {
  IDLE = 'IDLE',
  CRAWLING = 'CRAWLING',
  DRAFTING = 'DRAFTING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  FACT_CHECKING = 'FACT_CHECKING',
  OSMU_GENERATING = 'OSMU_GENERATING',
  CLASSIFYING = 'CLASSIFYING',
  PUBLISHING = 'PUBLISHING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export type CategoryType = 'Politics' | 'Economy' | 'Society' | 'Tech' | 'Culture' | 'General';

export interface CardNewsItem {
  sentence: string;
  imageUrl: string;
  imageSourceType: 'search' | 'generate';
  imageKeyword: string;
}

export interface FactCheckData {
  matchingScore: number;
  clickbaitScore: number;
  warnings: string[];
}

export interface DebateData {
  topic: string;
  pros: string[];
  cons: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  category: CategoryType;
  summary: string;
  fullText: string;
  imageUrl?: string;
  imageUrls?: string[];
  cardNews?: CardNewsItem[];
  shortFormScript?: string;
  factCheck?: FactCheckData;
  debate?: DebateData;
  createdAt: string;
  status: 'draft' | 'published';
  sources: string[];
}
