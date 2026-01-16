import { IsString, IsNotEmpty } from 'class-validator';

export class PaymentIdDto {
  @IsString({ message: '支付ID必须是字符串' })
  @IsNotEmpty({ message: '支付ID不能为空' })
  id: string;
}
