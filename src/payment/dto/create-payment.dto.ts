import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../entity/payment';

export class CreatePaymentDto {
  @IsString({ message: '订单编号不能为空' })
  orderNo: string;

  @IsString({ message: '用户编号不能为空' })
  userNo: string;

  @IsNumber({}, { message: '支付金额必须是数字' })
  @Min(0.01, { message: '支付金额不能小于0.01' })
  @Max(999999.99, { message: '支付金额不能超过999999.99' })
  amount: number;

  @IsEnum(PaymentMethod, { message: '支付方式值不正确' })
  method: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: '支付状态值不正确' })
  status?: PaymentStatus = PaymentStatus.PENDING;

  @IsOptional()
  @IsString({ message: '交易ID必须是字符串' })
  transactionId?: string;

  @IsOptional()
  @IsString({ message: '支付描述必须是字符串' })
  description?: string;

  @IsOptional()
  failureReason?: string;
}
