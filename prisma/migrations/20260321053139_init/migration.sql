-- CreateEnum
CREATE TYPE "HelpArticleType" AS ENUM ('USER_MANUAL', 'BUSINESS_PLAYBOOK', 'CHANGELOG', 'API_DOCS');

-- CreateEnum
CREATE TYPE "HelpArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HelpFeedbackType" AS ENUM ('HELPFUL', 'NOT_HELPFUL');

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "iconUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "articleCount" INTEGER NOT NULL DEFAULT 0,
    "languageCode" TEXT NOT NULL DEFAULT 'vi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "type" "HelpArticleType" NOT NULL,
    "status" "HelpArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "contentType" TEXT NOT NULL DEFAULT 'markdown',
    "featuredImageUrl" TEXT,
    "tags" TEXT[],
    "requiredPackage" TEXT,
    "requiredPackages" TEXT[],
    "contextPaths" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "languageCode" TEXT NOT NULL DEFAULT 'vi',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" "HelpFeedbackType" NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_languageCode_sortOrder_idx" ON "Category"("languageCode", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_languageCode_key" ON "Category"("slug", "languageCode");

-- CreateIndex
CREATE INDEX "Article_categoryId_languageCode_publishedAt_idx" ON "Article"("categoryId", "languageCode", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_languageCode_type_idx" ON "Article"("languageCode", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_languageCode_key" ON "Article"("slug", "languageCode");

-- CreateIndex
CREATE INDEX "Feedback_articleId_createdAt_idx" ON "Feedback"("articleId", "createdAt");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
