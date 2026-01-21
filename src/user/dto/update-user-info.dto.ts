import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoDto {
  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  nickName?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ description: '性别 0-未知 1-男 2-女', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  gender?: number;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
