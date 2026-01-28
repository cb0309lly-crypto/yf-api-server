import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色编码', example: 'R_MANAGER' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '角色名称', example: '经理' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '部门经理权限' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '状态', example: '1', enum: ['1', '0'] })
  @IsString()
  @IsOptional()
  status?: string;
}
