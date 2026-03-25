export interface HelpCenterCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string | null;
  sortOrder: number;
  articleCount: number;
  languageCode: string;
}

export interface HelpCenterArticleSummaryResponse {
  id: number;
  categoryId: number;
  type: string;
  title: string;
  slug: string;
  summary: string;
  featuredImageUrl?: string | null;
  tags?: string[];
  requiredPackage?: string | null;
  requiredPackages?: string[] | null;
  contextPaths?: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt: string | null;
  languageCode: string;
}

export interface HelpCenterArticleDetailResponse
  extends HelpCenterArticleSummaryResponse {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  content: string;
  contentType: 'markdown' | 'html' | 'json';
  metadata?: {
    videoUrl?: string;
    attachments?: unknown[];
  };
}

export interface HelpCenterArticleListResponse {
  articles: HelpCenterArticleSummaryResponse[];
  total: number;
}

export interface HelpCenterArticleDetailResultResponse {
  article: HelpCenterArticleDetailResponse;
  relatedArticles: Partial<HelpCenterArticleSummaryResponse>[];
  hasAccess: boolean;
}

export interface HelpCenterFeedbackResponse {
  id: number;
  articleId: number;
  userId: number | null;
  type: string;
  comment: string;
  createdAt: string;
}
