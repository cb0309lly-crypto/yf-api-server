import { IsString, IsNotEmpty } from 'class-validator';

export class WishlistIdDto {
  @IsString({ message: '收藏夹ID必须是字符串' })
  @IsNotEmpty({ message: '收藏夹ID不能为空' })
  id: string;
} 