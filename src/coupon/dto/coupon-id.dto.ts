import { IsString, IsNotEmpty } from 'class-validator';

export class CouponIdDto {
  @IsString({ message: '优惠券ID必须是字符串' })
  @IsNotEmpty({ message: '优惠券ID不能为空' })
  id: string;
} 