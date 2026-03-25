  import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FeedbackDto,
  HelpFeedbackType,
} from './dto/feedback.dto';
import { GetArticleDetailDto } from './dto/get-article-detail.dto';
import { GetArticlesDto } from './dto/get-articles.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { GetContextualHelpDto } from './dto/get-contextual-help.dto';
import { GetSearchSuggestionsDto } from './dto/get-search-suggestions.dto';
import {
  HelpCenterArticleDetailResultResponse,
  HelpCenterArticleListResponse,
  HelpCenterCategoryResponse,
  HelpCenterFeedbackResponse,
} from './interfaces/help-center-response.interface';
import { HelpCenterMapper } from './mappers/help-center.mapper';

@Injectable()
export class HelpCenterService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(HelpCenterMapper)
    private readonly mapper: HelpCenterMapper,
  ) {}

  async getCategories(
    query: GetCategoriesDto,
  ): Promise<HelpCenterCategoryResponse[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        languageCode: query.languageCode,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return categories.map((category) => this.mapper.toCategoryResponse(category));
  }

  async getArticles(query: GetArticlesDto): Promise<HelpCenterArticleListResponse> {
    const where = {
      languageCode: query.languageCode,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.searchQuery
        ? {
            OR: [
              { title: { contains: query.searchQuery, mode: 'insensitive' as const } },
              { summary: { contains: query.searchQuery, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.contextPath
        ? {
            contextPaths: {
              has: query.contextPath,
            },
          }
        : {}),
    };

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      articles: articles.map((article) =>
        this.mapper.toArticleSummaryResponse(article),
      ),
      total,
    };
  }

  async getArticleBySlug(
    slug: string,
    query: GetArticleDetailDto,
  ): Promise<HelpCenterArticleDetailResultResponse> {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        languageCode: query.languageCode,
      },
      include: {
        category: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const relatedArticles = await this.prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        languageCode: article.languageCode,
      },
      take: 5,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return {
      article: this.mapper.toArticleDetailResponse(article),
      relatedArticles: relatedArticles.map((item) =>
        this.mapper.toArticleSummaryResponse(item),
      ),
      hasAccess: true,
    };
  }

  async getSearchSuggestions(
    query: GetSearchSuggestionsDto,
  ): Promise<string[]> {
    const articles = await this.prisma.article.findMany({
      where: {
        languageCode: query.languageCode,
        title: {
          contains: query.query,
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
      },
      take: query.limit ?? 5,
    });

    return articles.map((article) => article.title);
  }

  async getContextualHelp(query: GetContextualHelpDto) {
    const articles = await this.prisma.article.findMany({
      where: {
        languageCode: query.languageCode,
        contextPaths: {
          has: query.contextPath,
        },
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: query.limit ?? 5,
    });

    return articles.map((article) => this.mapper.toArticleSummaryResponse(article));
  }

  async sendFeedback(
    articleId: number,
    dto: FeedbackDto,
    userId?: number,
  ): Promise<HelpCenterFeedbackResponse> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        articleId,
        userId: userId ?? null,
        type: dto.type as HelpFeedbackType,
        comment: dto.comment ?? '',
      },
    });

    return this.mapper.toFeedbackResponse(feedback);
  }
}
