import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ReceiverIdDto {
  @IsString({ message: '收货人编号必须是字符串' })
  @IsNotEmpty({ message: '收货人编号不能为空' })
  @Length(1, 50, { message: '收货人编号长度必须在1-50个字符之间' })
  no: string;
}
