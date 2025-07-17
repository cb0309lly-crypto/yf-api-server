import { IsString, IsNotEmpty } from 'class-validator';

export class OrderItemIdDto {
  @IsString({ message: '订单项ID必须是字符串' })
  @IsNotEmpty({ message: '订单项ID不能为空' })
  id: string;
} 