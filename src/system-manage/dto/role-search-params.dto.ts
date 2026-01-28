import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RoleSearchParamsDto {
  @ApiPropertyOptional({ description: '当前页', example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  current?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  size?: number;

  @ApiPropertyOptional({ description: '搜索关键词', example: '管理员' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态', example: '1', enum: ['1', '0'] })
  @IsString()
  @IsOptional()
  status?: string;
}
