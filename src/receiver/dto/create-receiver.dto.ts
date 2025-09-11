import { IsString, IsOptional, IsEmail, IsNumber, Length, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceiverDto {
  @IsString({ message: '收货人名称必须是字符串' })
  @Length(1, 100, { message: '收货人名称长度必须在1-100个字符之间' })
  name: string;

  @IsString({ message: '收货地址必须是字符串' })
  @Length(1, 200, { message: '收货地址长度必须在1-200个字符之间' })
  address: string;

  @IsString({ message: '电话号码必须是字符串' })
  @Length(11, 15, { message: '电话号码长度必须在11-15个字符之间' })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱不能超过100个字符' })
  email?: string;

  @IsNumber({}, { message: '分组编号必须是数字' })
  @Type(() => Number)
  @Min(1, { message: '分组编号不能小于1' })
  @Max(999999, { message: '分组编号不能超过999999' })
  groupBy: number;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(500, { message: '描述不能超过500个字符' })
  description?: string;

  @IsOptional()
  @IsString({ message: '用户编号必须是字符串' })
  @Length(1, 50, { message: '用户编号长度必须在1-50个字符之间' })
  userNo?: string;
}
