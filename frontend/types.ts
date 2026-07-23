export enum EHelpArticleType {
  USER_MANUAL = 'USER_MANUAL',
  BUSINESS_PLAYBOOK = 'BUSINESS_PLAYBOOK',
  CHANGELOG = 'CHANGELOG',
  API_DOCS = 'API_DOCS'
}

export enum EHelpFeedbackType {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
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
  publishedAt: string | null;
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

export interface FeedbackResponse {
  id: number;
  articleId: number;
  userId: number | null;
  type: EHelpFeedbackType;
  comment: string;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Admin types
export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  sortOrder: number;
  articleCount: number;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminArticle {
  id: number;
  categoryId: number;
  type: EHelpArticleType;
  title: string;
  slug: string;
  summary: string;
  content: string;
  contentType: 'markdown' | 'html' | 'json';
  featuredImageUrl?: string;
  tags: string[];
  requiredPackage?: string | null;
  contextPaths: string[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  iconUrl?: string;
  sortOrder: number;
  languageCode: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
  languageCode?: string;
}

export interface CreateArticleDto {
  categoryId: number;
  type: EHelpArticleType;
  title: string;
  summary: string;
  content: string;
  contentType: 'markdown' | 'html' | 'json';
  featuredImageUrl?: string;
  tags?: string[];
  requiredPackage?: string;
  contextPaths?: string[];
  isFeatured?: boolean;
  isPinned?: boolean;
  languageCode: string;
}

export interface UpdateArticleDto {
  categoryId?: number;
  type?: EHelpArticleType;
  title?: string;
  summary?: string;
  content?: string;
  contentType?: 'markdown' | 'html' | 'json';
  featuredImageUrl?: string;
  tags?: string[];
  requiredPackage?: string;
  contextPaths?: string[];
  isFeatured?: boolean;
  isPinned?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  languageCode?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}
