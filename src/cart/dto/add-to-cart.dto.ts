import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class AddToCartDto {
  @IsString({ message: '用户编号不能为空' })
  userNo: string;

  @IsString({ message: '商品编号不能为空' })
  productNo: string;

  @IsOptional()
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(1, { message: '数量不能小于1' })
  @Max(999, { message: '数量不能超过999' })
  quantity?: number = 1;
}
