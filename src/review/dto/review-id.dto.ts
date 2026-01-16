import { IsString, IsNotEmpty } from 'class-validator';

export class ReviewIdDto {
  @IsString({ message: '评价ID必须是字符串' })
  @IsNotEmpty({ message: '评价ID不能为空' })
  id: string;
}
