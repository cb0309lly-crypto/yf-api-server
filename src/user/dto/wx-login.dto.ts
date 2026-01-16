import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class WxLoginDto {
  @IsString({ message: '微信code不能为空' })
  @IsNotEmpty({ message: '微信code不能为空' })
  code: string;

  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;

  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;
}
