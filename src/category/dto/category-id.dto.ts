import { IsString, IsNotEmpty } from 'class-validator';

export class CategoryIdDto {
  @IsString({ message: '分类ID必须是字符串' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  id: string;
} 