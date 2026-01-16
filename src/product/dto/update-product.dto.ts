import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { ProductStatus } from '../../entity/product';

export class UpdateProductDto {
  @IsString({ message: '商品编号不能为空' })
  no: string;

  @IsOptional()
  @IsString({ message: '商品名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '商品价格必须是数字' })
  @Min(0, { message: '商品价格不能小于0' })
  @Max(999999.99, { message: '商品价格不能超过999999.99' })
  price?: number;

  @IsOptional()
  @IsUrl({}, { message: '图片URL格式不正确' })
  imgUrl?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: '商品状态值不正确' })
  status?: ProductStatus;

  @IsOptional()
  @IsString({ message: '商品规格必须是字符串' })
  specs?: string;

  @IsOptional()
  @IsString({ message: '商品单位必须是字符串' })
  unit?: string;

  @IsOptional()
  @IsString({ message: '商品标签必须是字符串' })
  tag?: string;

  @IsOptional()
  @IsString({ message: '公司编号必须是字符串' })
  companyNo?: string;

  @IsOptional()
  @IsString({ message: '分类编号必须是字符串' })
  categoryNo?: string;

  @IsOptional()
  @IsString({ message: '订单编号必须是字符串' })
  orderNo?: string;
}
