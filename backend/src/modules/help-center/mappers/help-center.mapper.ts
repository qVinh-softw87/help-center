import { Injectable } from '@nestjs/common';
import {
  HelpCenterArticleDetailResponse,
  HelpCenterArticleSummaryResponse,
  HelpCenterCategoryResponse,
  HelpCenterFeedbackResponse,
} from '../interfaces/help-center-response.interface';

@Injectable()
export class HelpCenterMapper {
  toCategoryResponse(category: Record<string, any>): HelpCenterCategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      iconUrl: category.iconUrl ?? null,
      sortOrder: category.sortOrder ?? 0,
      articleCount: category.articleCount ?? 0,
      languageCode: category.languageCode ?? 'vi',
    };
  }

  toArticleSummaryResponse(
    article: Record<string, any>,
  ): HelpCenterArticleSummaryResponse {
    return {
      id: article.id,
      categoryId: article.categoryId,
      type: article.type,
      title: article.title,
      slug: article.slug,
      summary: article.summary ?? '',
      featuredImageUrl: article.featuredImageUrl ?? null,
      tags: article.tags ?? [],
      requiredPackage: article.requiredPackage ?? null,
      requiredPackages: article.requiredPackages ?? null,
      contextPaths: article.contextPaths ?? [],
      viewCount: article.viewCount ?? 0,
      helpfulCount: article.helpfulCount ?? 0,
      notHelpfulCount: article.notHelpfulCount ?? 0,
      isFeatured: article.isFeatured ?? false,
      isPinned: article.isPinned ?? false,
      publishedAt: article.publishedAt?.toISOString?.() ?? article.publishedAt ?? null,
      languageCode: article.languageCode ?? 'vi',
    };
  }

  toArticleDetailResponse(
    article: Record<string, any>,
  ): HelpCenterArticleDetailResponse {
    return {
      ...this.toArticleSummaryResponse(article),
      category: {
        id: article.category?.id,
        name: article.category?.name ?? '',
        slug: article.category?.slug ?? '',
      },
      content: article.content ?? '',
      contentType: article.contentType ?? 'markdown',
      metadata: article.metadata,
    };
  }

  toFeedbackResponse(feedback: Record<string, any>): HelpCenterFeedbackResponse {
    return {
      id: feedback.id,
      articleId: feedback.articleId,
      userId: feedback.userId ?? null,
      type: feedback.type,
      comment: feedback.comment ?? '',
      createdAt: feedback.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
