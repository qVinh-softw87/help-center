import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { FeedbackDto } from "./dto/feedback.dto";
import { GetArticleDetailDto } from "./dto/get-article-detail.dto";
import { GetArticlesDto } from "./dto/get-articles.dto";
import { GetCategoriesDto } from "./dto/get-categories.dto";
import { GetContextualHelpDto } from "./dto/get-contextual-help.dto";
import { GetSearchSuggestionsDto } from "./dto/get-search-suggestions.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { HelpCenterService } from "./help-center.service";
import { UserRole } from "@prisma/client";

// Multer configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5) * 1024 * 1024;

const multerConfig = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException("Only JPEG, PNG, and WebP files are allowed"),
        false,
      );
    }
  },
};

@ApiTags("help-center")
@Controller("help-center")
export class HelpCenterController {
  constructor(
    @Inject(HelpCenterService)
    private readonly helpCenterService: HelpCenterService,
  ) {}

  @ApiOperation({ summary: "Lay danh sach danh muc help center" })
  @ApiQuery({ name: "languageCode", required: false, example: "vi" })
  @Get("categories")
  getCategories(@Query() query: GetCategoriesDto) {
    return this.helpCenterService.getCategories(query);
  }

  @ApiOperation({ summary: "Lay danh sach bai viet theo bo loc" })
  @Get("articles")
  getArticles(@Query() query: GetArticlesDto) {
    return this.helpCenterService.getArticles(query);
  }

  @ApiOperation({ summary: "Lay chi tiet bai viet theo slug" })
  @ApiParam({ name: "slug", example: "huong-dan-ket-noi-may-in-nhiet-k80" })
  @Get("articles/:slug")
  getArticleBySlug(
    @Param("slug") slug: string,
    @Query() query: GetArticleDetailDto,
  ) {
    return this.helpCenterService.getArticleBySlug(slug, query);
  }

  @ApiOperation({ summary: "Lay goi y tim kiem" })
  @Get("search/suggestions")
  getSearchSuggestions(@Query() query: GetSearchSuggestionsDto) {
    return this.helpCenterService.getSearchSuggestions(query);
  }

  @ApiOperation({ summary: "Lay bai viet theo context hien tai" })
  @Get("contextual-help")
  getContextualHelp(@Query() query: GetContextualHelpDto) {
    return this.helpCenterService.getContextualHelp(query);
  }

  @ApiOperation({ summary: "Gui feedback cho bai viet" })
  @ApiParam({ name: "articleId", example: 7 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("articles/:articleId/feedback")
  sendFeedback(
    @Param("articleId", ParseIntPipe) articleId: number,
    @Body() dto: FeedbackDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.helpCenterService.sendFeedback(articleId, dto, user.id);
  }

  // Admin endpoints
  @ApiOperation({ summary: "Tao danh muc moi" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @Post("admin/categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.helpCenterService.createCategory(dto);
  }

  @ApiOperation({ summary: "Cap nhat danh muc" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Category not found" })
  @Patch("admin/categories/:id")
  updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.helpCenterService.updateCategory(id, dto);
  }

  @ApiOperation({ summary: "Xoa danh muc" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Category not found" })
  @ApiConflictResponse({ description: "Category has existing articles" })
  @Delete("admin/categories/:id")
  deleteCategory(@Param("id", ParseIntPipe) id: number) {
    return this.helpCenterService.deleteCategory(id);
  }

  @ApiOperation({ summary: "Tao bai viet moi" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiConflictResponse({ description: "Slug already exists" })
  @Post("admin/articles")
  createArticle(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: { id: number; role: UserRole },
  ) {
    return this.helpCenterService.createArticle(dto, user.id, user.role);
  }

  @ApiOperation({ summary: "Cap nhat bai viet" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Article not found" })
  @ApiConflictResponse({ description: "Slug already exists" })
  @Patch("admin/articles/:id")
  updateArticle(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: { id: number; role: UserRole },
  ) {
    return this.helpCenterService.updateArticle(id, dto, user.id, user.role);
  }

  @ApiOperation({ summary: "Xoa bai viet (soft delete)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Article not found" })
  @Delete("admin/articles/:id")
  deleteArticle(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: { role: UserRole },
  ) {
    return this.helpCenterService.deleteArticle(id, user.role);
  }

  @ApiOperation({ summary: "Publish/unpublish bai viet" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Article not found" })
  @Patch("admin/articles/:id/publish")
  publishArticle(
    @Param("id", ParseIntPipe) id: number,
    @Body("publish") publish: boolean,
    @CurrentUser() user: { role: UserRole },
  ) {
    return this.helpCenterService.publishArticle(id, publish, user.role);
  }

  @ApiOperation({ summary: "Upload hinh anh cho bai viet" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Article not found" })
  @Post("admin/articles/:id/upload-image")
  @UseInterceptors(FileInterceptor("file", multerConfig))
  uploadArticleImage(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { role: UserRole },
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return this.helpCenterService.uploadArticleImage(
      id,
      file.filename,
      user.role,
    );
  }

  @Post('chat')
  async chatWithAI(@Body() chatDto: import('./dto/chat.dto').ChatDto) {
    return this.helpCenterService.chatWithAI(chatDto.query, chatDto.history);
  }
}
