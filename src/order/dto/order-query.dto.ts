import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderQueryDto {
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
  @IsString({ message: '订单状态必须是字符串' })
  orderStatus?: string;

  @IsOptional()
  @IsString({ message: '操作员编号必须是字符串' })
  operatorNo?: string;

  @IsOptional()
  @IsString({ message: '客户编号必须是字符串' })
  customerNo?: string;
}
