import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleMenusDto {
  @ApiProperty({
    description: '菜单ID数组',
    example: ['menu_001', 'menu_002', 'menu_003'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  menuIds: string[];
}
