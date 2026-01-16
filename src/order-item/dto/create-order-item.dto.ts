import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateOrderItemDto {
  @IsString({ message: '订单编号不能为空' })
  orderNo: string;

  @IsString({ message: '商品编号不能为空' })
  productNo: string;

  @IsNumber({}, { message: '数量必须是数字' })
  @Min(1, { message: '数量不能小于1' })
  @Max(999, { message: '数量不能超过999' })
  quantity: number;

  @IsNumber({}, { message: '单价必须是数字' })
  @Min(0, { message: '单价不能小于0' })
  @Max(999999.99, { message: '单价不能超过999999.99' })
  unitPrice: number;

  @IsOptional()
  @IsNumber({}, { message: '总价必须是数字' })
  @Min(0, { message: '总价不能小于0' })
  @Max(999999.99, { message: '总价不能超过999999.99' })
  totalPrice?: number;

  @IsOptional()
  @IsString({ message: '商品规格必须是字符串' })
  specs?: string;
}
