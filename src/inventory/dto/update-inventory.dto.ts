import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateInventoryDto {
  @IsString({ message: '库存编号不能为空' })
  no: string;

  @IsOptional()
  @IsNumber({}, { message: '库存数量必须是数字' })
  @Min(0, { message: '库存数量不能小于0' })
  @Max(999999, { message: '库存数量不能超过999999' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '预留数量必须是数字' })
  @Min(0, { message: '预留数量不能小于0' })
  @Max(999999, { message: '预留数量不能超过999999' })
  reservedQuantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '最低库存必须是数字' })
  @Min(0, { message: '最低库存不能小于0' })
  @Max(999999, { message: '最低库存不能超过999999' })
  minimumStock?: number;

  @IsOptional()
  @IsString({ message: '仓库位置必须是字符串' })
  location?: string;
} 