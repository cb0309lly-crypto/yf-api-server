import { IsString, IsOptional, IsEmail, IsPhoneNumber, Length, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString({ message: '公司名称必须是字符串' })
  @Length(1, 100, { message: '公司名称长度必须在1-100个字符之间' })
  name: string;

  @IsOptional()
  @IsString({ message: '公司描述必须是字符串' })
  @MaxLength(500, { message: '公司描述不能超过500个字符' })
  description?: string;

  @IsOptional()
  @IsString({ message: '公司地址必须是字符串' })
  @MaxLength(200, { message: '公司地址不能超过200个字符' })
  address?: string;

  @IsOptional()
  @IsString({ message: '税号必须是字符串' })
  @Length(15, 20, { message: '税号长度必须在15-20个字符之间' })
  taxId?: string;

  @IsOptional()
  @IsString({ message: '电话号码必须是字符串' })
  @Length(11, 15, { message: '电话号码长度必须在11-15个字符之间' })
  phoneNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱不能超过100个字符' })
  email?: string;

  @IsOptional()
  @IsString({ message: '创建者必须是字符串' })
  @MaxLength(50, { message: '创建者名称不能超过50个字符' })
  creator?: string;
}
