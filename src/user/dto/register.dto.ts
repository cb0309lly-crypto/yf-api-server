import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
