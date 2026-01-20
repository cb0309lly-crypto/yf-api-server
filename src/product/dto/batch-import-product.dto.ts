import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../entity/product';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 单个商品导入数据 DTO
 * @description 用于批量导入时的单个商品数据结构
 */
export class BatchImportProductItemDto {
  @ApiProperty({ description: '商品名称', example: '商品A' })
  @IsString({ message: '商品名称不能为空' })
  name: string;

  @ApiProperty({ description: '商品描述', required: false })
  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '商品价格', example: 99.99 })
  @IsNumber({}, { message: '商品价格必须是数字' })
  @Min(0, { message: '商品价格不能小于0' })
  @Max(999999.99, { message: '商品价格不能超过999999.99' })
  price: number;

  @ApiProperty({ description: '市场价格', required: false })
  @IsOptional()
  @IsNumber({}, { message: '市场价格必须是数字' })
  @Min(0, { message: '市场价格不能小于0' })
  @Max(999999.99, { message: '市场价格不能超过999999.99' })
  marketPrice?: number;

  @ApiProperty({ description: '商品图片URL', required: false })
  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imgUrl?: string;

  @ApiProperty({
    description: '商品状态',
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: '商品状态值不正确' })
  status?: ProductStatus;

  @ApiProperty({ description: '商品规格', required: false })
  @IsOptional()
  @IsString({ message: '商品规格必须是字符串' })
  specs?: string;

  @ApiProperty({ description: '商品单位', required: false })
  @IsOptional()
  @IsString({ message: '商品单位必须是字符串' })
  unit?: string;

  @ApiProperty({ description: '商品标签', required: false })
  @IsOptional()
  @IsString({ message: '商品标签必须是字符串' })
  tag?: string;

  @ApiProperty({ description: '分类编号', required: false })
  @IsOptional()
  @IsString({ message: '分类编号必须是字符串' })
  categoryNo?: string;

  @ApiProperty({ description: '最低购买数量', required: false, default: 1 })
  @IsOptional()
  @IsNumber({}, { message: '最低购买数量必须是数字' })
  @Min(1, { message: '最低购买数量不能小于1' })
  minBuyQuantity?: number;

  @ApiProperty({ description: '销售单位数量', required: false, default: 1 })
  @IsOptional()
  @IsNumber({}, { message: '销售单位数量必须是数字' })
  @Min(1, { message: '销售单位数量不能小于1' })
  saleUnitQuantity?: number;
}

/**
 * 批量导入商品请求 DTO
 * @description 用于批量导入商品的请求体
 */
export class BatchImportProductDto {
  @ApiProperty({
    description: '商品列表',
    type: [BatchImportProductItemDto],
    minItems: 1,
  })
  @IsArray({ message: '商品列表必须是数组' })
  @ArrayMinSize(1, { message: '商品列表至少包含一条数据' })
  @ValidateNested({ each: true })
  @Type(() => BatchImportProductItemDto)
  products: BatchImportProductItemDto[];
}

/**
 * 批量导入结果 DTO
 * @description 批量导入完成后的返回结果
 */
export class BatchImportResultDto {
  @ApiProperty({ description: '成功处理数量（新增+更新）' })
  successCount: number;

  @ApiProperty({ description: '新增数量' })
  insertCount: number;

  @ApiProperty({ description: '更新数量' })
  updateCount: number;

  @ApiProperty({ description: '失败数量' })
  failCount: number;

  @ApiProperty({ description: '失败详情', type: [Object] })
  failures: Array<{
    index: number;
    name: string;
    reason: string;
  }>;

  @ApiProperty({ description: '成功处理的商品编号列表' })
  successNos: string[];
}

