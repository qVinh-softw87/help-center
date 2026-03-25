export enum EHelpArticleType {
  USER_MANUAL = 'USER_MANUAL',
  BUSINESS_PLAYBOOK = 'BUSINESS_PLAYBOOK',
  CHANGELOG = 'CHANGELOG',
  API_DOCS = 'API_DOCS'
}

export enum EHelpArticleStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum EHelpFeedbackType {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL'
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  sortOrder: number;
  articleCount: number;
  languageCode: string;
}

export interface ArticleSummary {
  id: number;
  categoryId: number;
  type: EHelpArticleType;
  title: string;
  slug: string;
  summary: string;
  featuredImageUrl?: string;
  tags?: string[];
  requiredPackage?: string | null;
  requiredPackages?: string[] | null;
  contextPaths?: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt: string;
  languageCode: string;
}

export interface ArticleDetail extends ArticleSummary {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  content: string;
  contentType: 'markdown' | 'html' | 'json';
  metadata?: {
    videoUrl?: string;
    attachments?: any[];
  };
}

export interface ArticleResponse {
  article: ArticleDetail;
  relatedArticles: Partial<ArticleSummary>[];
  hasAccess: boolean;
}

export interface SearchResponse {
  articles: ArticleSummary[];
  total: number;
  suggestions: string[];
}

export interface FeedbackRequest {
  type: EHelpFeedbackType;
  comment?: string;
}

export interface FeedbackResponse {
  id: number;
  articleId: number;
  userId: number;
  type: EHelpFeedbackType;
  comment: string;
  createdAt: string;
}