import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum HelpFeedbackType {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL',
}

export class FeedbackDto {
  @IsEnum(HelpFeedbackType)
  type!: HelpFeedbackType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
