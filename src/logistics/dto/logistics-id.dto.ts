import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LogisticsIdDto {
  @IsString({ message: '物流编号必须是字符串' })
  @IsNotEmpty({ message: '物流编号不能为空' })
  @Length(1, 50, { message: '物流编号长度必须在1-50个字符之间' })
  id: string;
}
