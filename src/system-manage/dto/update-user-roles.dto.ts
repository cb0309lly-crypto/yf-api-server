import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({
    description: '角色编码数组',
    example: ['R_ADMIN', 'R_USER'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  roleCodes: string[];
}
