import { IsString, IsNotEmpty } from 'class-validator';

export class OrderIdDto {
  @IsString({ message: '订单ID必须是字符串' })
  @IsNotEmpty({ message: '订单ID不能为空' })
  id: string;
}
