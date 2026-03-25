import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class GetSearchSuggestionsDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsOptional()
  @IsString()
  languageCode?: string = 'vi';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 5;
}
