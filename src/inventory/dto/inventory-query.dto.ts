import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { InventoryStatus } from '../../entity/inventory';

export class InventoryQueryDto {
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
  @IsString({ message: '商品编号必须是字符串' })
  productNo?: string;

  @IsOptional()
  @IsString({ message: '仓库位置必须是字符串' })
  location?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(InventoryStatus, { message: '库存状态值不正确' })
  status?: InventoryStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最小库存必须是数字' })
  @Min(0, { message: '最小库存不能小于0' })
  minQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最大库存必须是数字' })
  @Min(0, { message: '最大库存不能小于0' })
  maxQuantity?: number;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}
