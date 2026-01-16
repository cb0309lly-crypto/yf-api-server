import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '用户编号必须是字符串' })
  userNo?: string;

  @IsOptional()
  @IsString({ message: '商品编号必须是字符串' })
  productNo?: string;

  @IsOptional()
  @IsString({ message: '订单编号必须是字符串' })
  orderNo?: string;

  @IsOptional()
  @IsString({ message: '评价状态必须是字符串' })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '评分必须是数字' })
  @Min(1, { message: '评分不能小于1' })
  @Max(5, { message: '评分不能超过5' })
  rating?: number;
}
