import { IsOptional, IsString, IsNumber, Min, Max, IsEmail } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryCompanyDto {
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
  @IsString({ message: '公司名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '公司描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '公司地址必须是字符串' })
  address?: string;

  @IsOptional()
  @IsString({ message: '税号必须是字符串' })
  taxId?: string;

  @IsOptional()
  @IsString({ message: '电话号码必须是字符串' })
  phoneNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString({ message: '创建者必须是字符串' })
  creator?: string;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}
