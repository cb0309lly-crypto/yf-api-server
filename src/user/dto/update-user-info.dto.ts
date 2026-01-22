import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoDto {
  @ApiProperty({ description: '昵称', required: false, maxLength: 50 })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MaxLength(50, { message: '昵称长度不能超过50个字符' })
  nickName?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatarUrl?: string;

  @ApiProperty({
    description: '性别 0-未知 1-男 2-女',
    required: false,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  @IsInt({ message: '性别必须是整数' })
  @Min(0, { message: '性别值不能小于0' })
  @Max(2, { message: '性别值不能大于2' })
  gender?: number;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phoneNumber?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString({ message: '邮箱必须是字符串' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: '邮箱格式不正确',
  })
  email?: string;
}

