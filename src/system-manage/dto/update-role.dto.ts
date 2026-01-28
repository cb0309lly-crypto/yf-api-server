import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称', example: '经理' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '角色描述', example: '部门经理权限' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '状态', example: '1', enum: ['1', '0'] })
  @IsString()
  @IsOptional()
  status?: string;
}
