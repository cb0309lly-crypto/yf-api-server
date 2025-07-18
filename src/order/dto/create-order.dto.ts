import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { OrderStatus } from '../../entity/order';

export class CreateOrderDto {
  @IsString({ message: '用户编号不能为空' })
  userNo: string;

  @IsOptional()
  @IsString({ message: '收货地址必须是字符串' })
  shipAddress?: string;

  @IsOptional()
  @IsNumber({}, { message: '订单总额必须是数字' })
  @Min(0, { message: '订单总额不能小于0' })
  @Max(999999.99, { message: '订单总额不能超过999999.99' })
  orderTotal?: number;

  @IsOptional()
  @IsEnum(OrderStatus, { message: '订单状态值不正确' })
  orderStatus?: OrderStatus = OrderStatus.ORDERED;

  @IsOptional()
  @IsString({ message: '订单描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;

  @IsOptional()
  @IsString({ message: '操作员编号必须是字符串' })
  operatorNo?: string;

  @IsOptional()
  @IsString({ message: '客户编号必须是字符串' })
  customerNo?: string;

  @IsOptional()
  @IsString({ message: '商品编号必须是字符串' })
  productNo?: string;

  @IsOptional()
  @IsString({ message: '物料编号必须是字符串' })
  materialNo?: string;

  @IsOptional()
  @IsString({ message: '物流编号必须是字符串' })
  logisticsNo?: string;
} 