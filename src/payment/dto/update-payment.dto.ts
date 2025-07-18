import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../entity/payment';

export class UpdatePaymentDto {
  @IsString({ message: '支付编号不能为空' })
  no: string;

  @IsOptional()
  @IsNumber({}, { message: '支付金额必须是数字' })
  @Min(0.01, { message: '支付金额不能小于0.01' })
  @Max(999999.99, { message: '支付金额不能超过999999.99' })
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod, { message: '支付方式值不正确' })
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: '支付状态值不正确' })
  status?: PaymentStatus;

  @IsOptional()
  @IsString({ message: '交易ID必须是字符串' })
  transactionId?: string;

  @IsOptional()
  @IsString({ message: '支付描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '失败原因必须是字符串' })
  failureReason?: string;

  @IsOptional()
  @IsNumber({}, { message: '退款金额必须是数字' })
  @Min(0, { message: '退款金额不能小于0' })
  @Max(999999.99, { message: '退款金额不能超过999999.99' })
  refundAmount?: number;
} 