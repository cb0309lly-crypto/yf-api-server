import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
  MaxLength,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../entity/order';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  // userNo 将从用户上下文中获取，不需要在 DTO 中定义

  @ApiProperty({
    description: '收货地址',
    example: '广东省深圳市南山区科技园',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '收货地址必须是字符串' })
  @MaxLength(500, { message: '收货地址不能超过500个字符' })
  shipAddress?: string;

  @ApiProperty({
    description: '收货人姓名',
    example: '张三',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '收货人姓名必须是字符串' })
  @MaxLength(50, { message: '收货人姓名不能超过50个字符' })
  receiverName?: string;

  @ApiProperty({
    description: '收货人手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '收货人手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '收货人手机号格式不正确' })
  receiverPhone?: string;

  @ApiProperty({
    description: '订单总额',
    example: 299.99,
    required: false,
    minimum: 0,
    maximum: 999999.99,
  })
  @IsOptional()
  @IsNumber({}, { message: '订单总额必须是数字' })
  @Min(0, { message: '订单总额不能小于0' })
  @Max(999999.99, { message: '订单总额不能超过999999.99' })
  orderTotal?: number;

  @ApiProperty({
    description: '订单状态',
    enum: OrderStatus,
    required: false,
    default: OrderStatus.ORDERED,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: '订单状态值不正确' })
  orderStatus?: OrderStatus = OrderStatus.ORDERED;

  @ApiProperty({
    description: '订单描述',
    example: '春节促销订单',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '订单描述必须是字符串' })
  @MaxLength(500, { message: '订单描述不能超过500个字符' })
  description?: string;

  @ApiProperty({
    description: '备注',
    example: '请尽快发货',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(500, { message: '备注不能超过500个字符' })
  remark?: string;

  @ApiProperty({
    description: '操作员编号',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '操作员编号必须是字符串' })
  operatorNo?: string;

  @ApiProperty({
    description: '客户编号',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '客户编号必须是字符串' })
  customerNo?: string;

  @ApiProperty({
    description: '商品编号',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '商品编号必须是字符串' })
  productNo?: string;

  @ApiProperty({
    description: '物料编号',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '物料编号必须是字符串' })
  materialNo?: string;

  @ApiProperty({
    description: '物流编号',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '物流编号必须是字符串' })
  logisticsNo?: string;

  @ApiProperty({
    description: '优惠券ID',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '优惠券ID必须是字符串' })
  couponId?: string;

  @ApiProperty({
    description: '订单项列表',
    type: [OrderItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '订单项必须是数组' })
  @ArrayMinSize(1, { message: '订单项不能为空' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}

