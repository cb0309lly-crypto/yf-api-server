import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'zhangsan',
    minLength: 3,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(20, { message: '用户名长度不能超过20个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
    minLength: 6,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @MaxLength(20, { message: '密码长度不能超过20个字符' })
  password: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({
    description: '昵称',
    example: '张三',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(50, { message: '昵称长度不能超过50个字符' })
  nickname?: string;

  @ApiProperty({
    description: '头像URL',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  @ApiProperty({
    description: '地址',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '地址必须是字符串' })
  @MaxLength(200, { message: '地址长度不能超过200个字符' })
  address?: string;

  @ApiProperty({
    description: '个人描述',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '个人描述必须是字符串' })
  @MaxLength(500, { message: '个人描述长度不能超过500个字符' })
  description?: string;
}

