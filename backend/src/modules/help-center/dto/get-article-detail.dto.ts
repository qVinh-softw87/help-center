import { IsOptional, IsString } from 'class-validator';

export class GetArticleDetailDto {
  @IsOptional()
  @IsString()
  languageCode?: string = 'vi';
}
