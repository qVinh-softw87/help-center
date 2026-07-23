import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessage {
  @IsString()
  role: 'user' | 'model';

  @IsString()
  text: string;
}

export class ChatDto {
  @IsString()
  query: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  history?: ChatMessage[];
}
