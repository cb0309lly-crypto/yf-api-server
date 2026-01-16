import { IsString, IsNotEmpty } from 'class-validator';

export class ProductIdDto {
  @IsString({ message: '商品ID必须是字符串' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  id: string;
}
