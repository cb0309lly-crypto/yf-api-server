import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentQueryDto {
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
  @IsString({ message: '订单编号必须是字符串' })
  orderNo?: string;

  @IsOptional()
  @IsString({ message: '用户编号必须是字符串' })
  userNo?: string;

  @IsOptional()
  @IsString({ message: '支付状态必须是字符串' })
  status?: string;

  @IsOptional()
  @IsString({ message: '支付方式必须是字符串' })
  method?: string;
} 