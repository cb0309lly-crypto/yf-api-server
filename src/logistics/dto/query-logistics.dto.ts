import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LogisticsCurrentStatus } from '../../entity/logistics';

export class QueryLogisticsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '物流名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '发送方编号必须是字符串' })
  senderNo?: string;

  @IsOptional()
  @IsString({ message: '接收方编号必须是字符串' })
  receiverNo?: string;

  @IsOptional()
  @IsString({ message: '订单编号必须是字符串' })
  orderNo?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(LogisticsCurrentStatus, { message: '物流状态值不正确' })
  currentStatus?: LogisticsCurrentStatus;

  @IsOptional()
  @IsDateString({}, { message: '接收时间格式不正确' })
  receive_time?: string;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}
