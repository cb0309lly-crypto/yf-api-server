import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Length,
  MaxLength,
} from 'class-validator';
import { LogisticsCurrentStatus } from '../../entity/logistics';

export class CreateLogisticsDto {
  @IsString({ message: '物流名称必须是字符串' })
  @Length(1, 100, { message: '物流名称长度必须在1-100个字符之间' })
  name: string;

  @IsOptional()
  @IsString({ message: '发送方编号必须是字符串' })
  @Length(1, 50, { message: '发送方编号长度必须在1-50个字符之间' })
  senderNo?: string;

  @IsOptional()
  @IsString({ message: '接收方编号必须是字符串' })
  @Length(1, 50, { message: '接收方编号长度必须在1-50个字符之间' })
  receiverNo?: string;

  @IsOptional()
  @IsString({ message: '订单编号必须是字符串' })
  @Length(1, 50, { message: '订单编号长度必须在1-50个字符之间' })
  orderNo?: string;

  @IsOptional()
  @IsEnum(LogisticsCurrentStatus, { message: '物流状态值不正确' })
  currentStatus?: LogisticsCurrentStatus;

  @IsOptional()
  @IsDateString({}, { message: '接收时间格式不正确' })
  receive_time?: Date;
}
