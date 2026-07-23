import { HelpArticleType, HelpArticleStatus } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsEnum(HelpArticleType)
  type: HelpArticleType;

  @IsOptional()
  @IsEnum(HelpArticleStatus)
  status?: HelpArticleStatus = HelpArticleStatus.DRAFT;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  summary?: string = '';

  @IsOptional()
  @IsString()
  content?: string = '';

  @IsOptional()
  @IsString()
  contentType?: string = 'markdown';

  @IsOptional()
  @IsString()
  featuredImageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @IsOptional()
  @IsString()
  requiredPackage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredPackages?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contextPaths?: string[] = [];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean = false;

  @IsOptional()
  @IsString()
  languageCode?: string = 'vi';
}
