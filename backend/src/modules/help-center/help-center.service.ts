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
  HelpCenterCategoryListResponse,
  HelpCenterFeedbackResponse,
} from "./interfaces/help-center-response.interface";
import { HelpCenterMapper } from "./mappers/help-center.mapper";
import { HelpArticleStatus, UserRole } from "@prisma/client";
import { AiService } from "../ai/ai.service";

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
    private readonly aiService: AiService,
  ) {}

  private async invalidateCache(pattern: string): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;
      if (store && typeof store.reset === 'function') {
        await store.reset();
        console.log(`[Cache] INVALIDATED pattern: ${pattern}`);
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
  ): Promise<HelpCenterCategoryListResponse> {
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 10), 100);
    const skip = (page - 1) * limit;

    const cacheKey = `help-center:categories:${query.languageCode || "vi"}:page:${page}:limit:${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return cached as HelpCenterCategoryListResponse;
    }
    console.log(`[Cache] MISS: ${cacheKey}`);

    const where = {
      languageCode: query.languageCode,
    };

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: {
          sortOrder: "asc",
        },
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    const result = {
      categories: categories.map((category) =>
        this.mapper.toCategoryResponse(category),
      ),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
    await this.cacheManager.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes
    return result;
  }

  async getArticles(
    query: GetArticlesDto,
  ): Promise<HelpCenterArticleListResponse> {
    const cacheKey = `help-center:articles:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return cached as HelpCenterArticleListResponse;
    }
    console.log(`[Cache] MISS: ${cacheKey}`);
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
                  search: query.searchQuery.split(' ').join(' & '),
                },
              },
              {
                summary: {
                  search: query.searchQuery.split(' ').join(' & '),
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
    const limit = Math.min(Number(query.limit ?? 10), 100);

    const start = performance.now();
    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);
    const end = performance.now();
    if (query.searchQuery) {
      console.log(`[Search] getArticles query took ${(end - start).toFixed(2)}ms`);
    }

    const result = {
      articles: articles.map((article) =>
        this.mapper.toArticleSummaryResponse(article),
      ),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
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
      console.log(`[Cache] HIT: ${cacheKey}`);
      return cached as HelpCenterArticleDetailResultResponse;
    }
    console.log(`[Cache] MISS: ${cacheKey}`);
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
      console.log(`[Cache] HIT: ${cacheKey}`);
      return cached as string[];
    }
    console.log(`[Cache] MISS: ${cacheKey}`);
    const start = performance.now();
    const articles = await this.prisma.article.findMany({
      where: {
        languageCode: query.languageCode,
        deletedAt: null,
        title: {
          search: query.query.split(' ').join(' & '),
        },
      },
      select: {
        title: true,
      },
      take: Math.min(query.limit ?? 5, 100),
    });
    const end = performance.now();
    console.log(`[Search] getSearchSuggestions query took ${(end - start).toFixed(2)}ms`);
    const result = articles.map((article) => article.title);
    await this.cacheManager.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes
    return result;
  }

  async getContextualHelp(query: GetContextualHelpDto) {
    const cacheKey = `help-center:contextual-help:${query.contextPath}:${query.languageCode || "vi"}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return cached as any;
    }
    console.log(`[Cache] MISS: ${cacheKey}`);
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
      take: Math.min(query.limit ?? 5, 100),
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

  // --- Admin Methods ---

  async getAdminCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAdminArticles() {
    return this.prisma.article.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: {
          select: { name: true },
        },
      },
    });
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
  async createArticle(dto: CreateArticleDto, userId: number, userRole: UserRole) {
    let slug = dto.slug || generateSlug(dto.title);
    if (!(await this.isSlugUnique(slug, dto.languageCode || "vi"))) {
      throw new ConflictException("Slug already exists");
    }

    const article = await this.prisma.article.create({
      data: {
        ...dto,
        slug,
        authorId: userId,
        publishedAt:
          dto.status === HelpArticleStatus.PUBLISHED ? new Date() : null,
      },
    });
    await this.invalidateCache("help-center:");
    return this.mapper.toArticleSummaryResponse(article);
  }

  async updateArticle(id: number, dto: UpdateArticleDto, userId: number, userRole: UserRole) {
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
      url: `/uploads/${filename}`,
    };
  }

  async chatWithAI(query: string, history: Array<{role: string, text: string}> = []) {
    const start = performance.now();
    const articles = await this.prisma.article.findMany({
      where: {
        OR: [
          { title: { search: query.split(' ').join(' & ') } },
          { content: { search: query.split(' ').join(' & ') } },
        ],
        status: 'PUBLISHED',
      },
      take: 3,
      select: { title: true, content: true, slug: true }
    });
    const end = performance.now();
    console.log(`[Search] chatWithAI query took ${(end - start).toFixed(2)}ms`);
    return this.aiService.generateAnswer(query, articles);
  }
}
