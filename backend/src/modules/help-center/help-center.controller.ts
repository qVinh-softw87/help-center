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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FeedbackDto } from './dto/feedback.dto';
import { GetArticleDetailDto } from './dto/get-article-detail.dto';
import { GetArticlesDto } from './dto/get-articles.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { GetContextualHelpDto } from './dto/get-contextual-help.dto';
import { GetSearchSuggestionsDto } from './dto/get-search-suggestions.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HelpCenterService } from './help-center.service';

@ApiTags('help-center')
@ApiBearerAuth()
@Controller('help-center')
export class HelpCenterController {
  constructor(
    @Inject(HelpCenterService)
    private readonly helpCenterService: HelpCenterService,
  ) {}

  @ApiOperation({ summary: 'Lay danh sach danh muc help center' })
  @ApiQuery({ name: 'languageCode', required: false, example: 'vi' })
  @Get('categories')
  getCategories(@Query() query: GetCategoriesDto) {
    return this.helpCenterService.getCategories(query);
  }

  @ApiOperation({ summary: 'Lay danh sach bai viet theo bo loc' })
  @Get('articles')
  getArticles(@Query() query: GetArticlesDto) {
    return this.helpCenterService.getArticles(query);
  }

  @ApiOperation({ summary: 'Lay chi tiet bai viet theo slug' })
  @ApiParam({ name: 'slug', example: 'huong-dan-ket-noi-may-in-nhiet-k80' })
  @Get('articles/:slug')
  getArticleBySlug(
    @Param('slug') slug: string,
    @Query() query: GetArticleDetailDto,
  ) {
    return this.helpCenterService.getArticleBySlug(slug, query);
  }

  @ApiOperation({ summary: 'Lay goi y tim kiem' })
  @Get('search/suggestions')
  getSearchSuggestions(@Query() query: GetSearchSuggestionsDto) {
    return this.helpCenterService.getSearchSuggestions(query);
  }

  @ApiOperation({ summary: 'Lay bai viet theo context hien tai' })
  @Get('contextual-help')
  getContextualHelp(@Query() query: GetContextualHelpDto) {
    return this.helpCenterService.getContextualHelp(query);
  }

  @ApiOperation({ summary: 'Gui feedback cho bai viet' })
  @ApiParam({ name: 'articleId', example: 7 })
  @UseGuards(JwtAuthGuard)
  @Post('articles/:articleId/feedback')
  sendFeedback(
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() dto: FeedbackDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.helpCenterService.sendFeedback(articleId, dto, user.id);
  }
}
