import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../../prisma/prisma.service";
import { FeedbackDto, HelpFeedbackType } from "./dto/feedback.dto";
import { GetArticleDetailDto } from "./dto/get-article-detail.dto";
import { GetArticlesDto } from "./dto/get-articles.dto";
import { GetCategoriesDto } from "./dto/get-categories.dto";
import { GetContextualHelpDto } from "./dto/get-contextual-help.dto";
import { GetSearchSuggestionsDto } from "./dto/get-search-suggestions.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import {
  HelpCenterArticleDetailResultResponse,
  HelpCenterArticleListResponse,
  HelpCenterCategoryResponse,
  HelpCenterFeedbackResponse,
} from "./interfaces/help-center-response.interface";
import { HelpCenterMapper } from "./mappers/help-center.mapper";
import { HelpArticleStatus, UserRole } from "@prisma/client";

const CACHE_KEYS = {
  CATEGORIES: "help-center:categories",
  ARTICLES: "help-center:articles",
  ARTICLE_DETAIL: "help-center:article:",
  SEARCH_SUGGESTIONS: "help-center:search-suggestions",
  CONTEXTUAL_HELP: "help-center:contextual-help",
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class HelpCenterService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(HelpCenterMapper)
    private readonly mapper: HelpCenterMapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private async invalidateCache(pattern: string): Promise<void> {
    try {
      if (this.cacheManager.store && typeof (this.cacheManager.store as any).reset === 'function') {
        await (this.cacheManager.store as any).reset();
      }
    } catch (e) {
      console.warn('Cache reset failed', e);
    }
  }

  private buildContextPathVariants(contextPath: string): string[] {
    const sanitizedPath = contextPath.trim().replace(/\/+$/, "");

    if (!sanitizedPath || sanitizedPath === "/") {
      return ["/"];
    }

    const segments = sanitizedPath.split("/").filter(Boolean);
    const variants: string[] = [];

    for (let index = 1; index <= segments.length; index += 1) {
      variants.push(`/${segments.slice(0, index).join("/")}`);
    }

    return variants;
  }

  private async isSlugUnique(
    slug: string,
    languageCode: string,
    excludeId?: number,
  ): Promise<boolean> {
    const existing = await this.prisma.article.findFirst({
      where: {
        slug,
        languageCode,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return !existing;
  }

  async getCategories(
    query: GetCategoriesDto,
  ): Promise<HelpCenterCategoryResponse[]> {
    const cacheKey = `help-center:categories:${query.languageCode || "vi"}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as HelpCenterCategoryResponse[];
    }
    const categories = await this.prisma.category.findMany({
      where: {
        languageCode: query.languageCode,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
    const result = categories.map((category) =>
      this.mapper.toCategoryResponse(category),
    );
    await this.cacheManager.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes
    return result;
  }

  async getArticles(
    query: GetArticlesDto,
  ): Promise<HelpCenterArticleListResponse> {
    const cacheKey = `help-center:articles:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as HelpCenterArticleListResponse;
    }
    const contextPathVariants = query.contextPath
      ? this.buildContextPathVariants(query.contextPath)
      : [];

    const where = {
      languageCode: query.languageCode,
      deletedAt: null,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.searchQuery
        ? {
            OR: [
              {
                title: {
                  contains: query.searchQuery,
                  mode: "insensitive" as const,
                },
              },
              {
                summary: {
                  contains: query.searchQuery,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(query.contextPath
        ? {
            contextPaths: {
              hasSome: contextPathVariants,
            },
          }
        : {}),
    };

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);
    const result = {
      articles: articles.map((article) =>
        this.mapper.toArticleSummaryResponse(article),
      ),
      total,
    };
    await this.cacheManager.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes
    return result;
  }

  async getArticleBySlug(
    slug: string,
    query: GetArticleDetailDto,
  ): Promise<HelpCenterArticleDetailResultResponse> {
    const cacheKey = `help-center:article:${slug}:${query.languageCode || "vi"}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as HelpCenterArticleDetailResultResponse;
    }
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        languageCode: query.languageCode,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    const relatedArticles = await this.prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        languageCode: article.languageCode,
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        publishedAt: "desc",
      },
    });
    const result = {
      article: this.mapper.toArticleDetailResponse(article),
      relatedArticles: relatedArticles.map((item) =>
        this.mapper.toArticleSummaryResponse(item),
      ),
      hasAccess: !article.requiredPackage,
    };
    await this.cacheManager.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
    return result;
  }

  async getSearchSuggestions(
    query: GetSearchSuggestionsDto,
  ): Promise<string[]> {
    const cacheKey = `help-center:search-suggestions:${query.query}:${query.languageCode || "vi"}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as string[];
    }
    const articles = await this.prisma.article.findMany({
      where: {
        languageCode: query.languageCode,
        deletedAt: null,
        title: {
          contains: query.query,
          mode: "insensitive",
        },
      },
      select: {
        title: true,
      },
      take: query.limit ?? 5,
    });
    const result = articles.map((article) => article.title);
    await this.cacheManager.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
    return result;
  }

  async getContextualHelp(query: GetContextualHelpDto) {
    const cacheKey = `help-center:contextual-help:${query.contextPath}:${query.languageCode || "vi"}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as any;
    }
    const contextPathVariants = this.buildContextPathVariants(
      query.contextPath,
    );

    const articles = await this.prisma.article.findMany({
      where: {
        languageCode: query.languageCode,
        deletedAt: null,
        contextPaths: {
          hasSome: contextPathVariants,
        },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: query.limit ?? 5,
    });
    const result = articles.map((article) =>
      this.mapper.toArticleSummaryResponse(article),
    );
    await this.cacheManager.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
    return result;
  }

  async sendFeedback(
    articleId: number,
    dto: FeedbackDto,
    userId?: number,
  ): Promise<HelpCenterFeedbackResponse> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, deletedAt: true },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException("Article not found");
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        articleId,
        userId: userId ?? null,
        type: dto.type as HelpFeedbackType,
        comment: dto.comment ?? "",
      },
    });

    return this.mapper.toFeedbackResponse(feedback);
  }

  // Admin methods for Categories
  async createCategory(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: dto,
    });
    await this.invalidateCache("help-center:categories");
    return this.mapper.toCategoryResponse(category);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache("help-center:categories");
    return this.mapper.toCategoryResponse(category);
  }

  async deleteCategory(id: number) {
    const articleCount = await this.prisma.article.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (articleCount > 0) {
      throw new ConflictException(
        "Cannot delete category with existing articles",
      );
    }
    await this.prisma.category.delete({
      where: { id },
    });
    await this.invalidateCache("help-center:categories");
    return { success: true };
  }

  // Admin methods for Articles
  async createArticle(dto: CreateArticleDto, userRole: UserRole) {
    let slug = dto.slug || generateSlug(dto.title);
    if (!(await this.isSlugUnique(slug, dto.languageCode || "vi"))) {
      throw new ConflictException("Slug already exists");
    }

    const article = await this.prisma.article.create({
      data: {
        ...dto,
        slug,
        publishedAt:
          dto.status === HelpArticleStatus.PUBLISHED ? new Date() : null,
      },
    });
    await this.invalidateCache("help-center:");
    return this.mapper.toArticleSummaryResponse(article);
  }

  async updateArticle(id: number, dto: UpdateArticleDto, userRole: UserRole) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException("Article not found");
    }

    let slug = dto.slug;
    if (dto.title && !slug) {
      slug = generateSlug(dto.title);
    }
    if (slug && slug !== existing.slug) {
      if (!(await this.isSlugUnique(slug, existing.languageCode, id))) {
        throw new ConflictException("Slug already exists");
      }
    }

    let publishedAt = existing.publishedAt;
    if (dto.status === HelpArticleStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        slug,
        publishedAt,
      },
    });
    await this.invalidateCache("help-center:");
    return this.mapper.toArticleSummaryResponse(article);
  }

  async deleteArticle(id: number, userRole: UserRole) {
    await this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.invalidateCache("help-center:");
    return { success: true };
  }

  async publishArticle(id: number, publish: boolean, userRole: UserRole) {
    const article = await this.prisma.article.update({
      where: { id },
      data: {
        status: publish ? HelpArticleStatus.PUBLISHED : HelpArticleStatus.DRAFT,
        publishedAt: publish ? new Date() : null,
      },
    });
    await this.invalidateCache("help-center:");
    return this.mapper.toArticleSummaryResponse(article);
  }

  async uploadArticleImage(
    articleId: number,
    filename: string,
    userRole: UserRole,
  ) {
    await this.prisma.article.update({
      where: { id: articleId },
      data: {
        featuredImageUrl: `/uploads/${filename}`,
      },
    });
    await this.invalidateCache("help-center:");
    return {
      message: 'Feedback submitted successfully',
    };
  }

  async chatWithAI(query: string, history: Array<{role: string, text: string}> = []) {
    // 1. Search for relevant articles
    const articles = await this.prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
        status: 'PUBLISHED',
      },
      take: 3,
      select: { title: true, content: true }
    });

    const contextText = articles.map(a => `Title: ${a.title}\nContent: ${a.content}`).join('\n\n');
    
    // 2. Call LLM API if key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are a helpful support assistant. Answer the user's question based ONLY on the following context articles.\n\nContext:\n${contextText}\n\nQuestion: ${query}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await response.json() as any;
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return { response: data.candidates[0].content.parts[0].text };
        }
      } catch (e) {
        console.error("Gemini API error:", e);
      }
    }

    // 3. Fallback / Mock response
    if (articles.length > 0) {
      return { 
        response: `Dựa vào tài liệu của chúng tôi, tôi tìm thấy ${articles.length} bài viết liên quan. Ví dụ bài "${articles[0].title}". Hãy hỏi cụ thể hơn hoặc đọc bài viết này nhé! (Đây là câu trả lời tự động do chưa cấu hình GEMINI_API_KEY).` 
      };
    }
    
    return {
      response: "Xin lỗi, tôi không tìm thấy thông tin nào liên quan đến câu hỏi của bạn trong hệ thống tài liệu. (Đây là câu trả lời tự động do chưa cấu hình GEMINI_API_KEY)."
    };
  }
}
