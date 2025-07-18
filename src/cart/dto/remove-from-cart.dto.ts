import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveFromCartDto {
  @IsString({ message: '用户编号不能为空' })
  @IsNotEmpty({ message: '用户编号不能为空' })
  userNo: string;

  @IsString({ message: '商品编号不能为空' })
  @IsNotEmpty({ message: '商品编号不能为空' })
  productNo: string;
} 