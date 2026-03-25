import { HelpArticleType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetArticlesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsEnum(HelpArticleType)
  type?: HelpArticleType;

  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  contextPath?: string;

  @IsOptional()
  @Transform(({ value }) => value ?? 'vi')
  @IsString()
  languageCode?: string = 'vi';
}
