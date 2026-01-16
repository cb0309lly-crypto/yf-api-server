import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class OpenIdLoginDto {
  @IsString({ message: 'OpenID不能为空' })
  @IsNotEmpty({ message: 'OpenID不能为空' })
  openId: string;

  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;

  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;
}
