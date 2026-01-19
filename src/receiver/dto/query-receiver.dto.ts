import {
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryReceiverDto {
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
  @IsString({ message: '收货人名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '收货地址必须是字符串' })
  address?: string;

  @IsOptional()
  @IsString({ message: '电话号码必须是字符串' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '分组编号必须是数字' })
  @Min(1, { message: '分组编号不能小于1' })
  @Max(999999, { message: '分组编号不能超过999999' })
  groupBy?: number;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '用户编号必须是字符串' })
  userNo?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}
