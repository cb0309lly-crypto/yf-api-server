import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ProductStatus } from '../../entity/product';

export class QueryProductDto {
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
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @IsOptional()
  @IsString({ message: '分类编号必须是字符串' })
  categoryNo?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(ProductStatus, { message: '商品状态值不正确' })
  status?: ProductStatus;

  @IsOptional()
  @IsString({ message: '公司编号必须是字符串' })
  companyNo?: string;

  @IsOptional()
  @IsString({ message: '商品名称必须是字符串' })
  name?: string;
} 