import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiPropertyOptional({ description: '父菜单ID', example: 'menu_001' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: '菜单名称', example: '商品管理' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '路由名称', example: 'product' })
  @IsString()
  @IsNotEmpty()
  route: string;

  @ApiPropertyOptional({ description: '图标', example: 'icon-park-outline:commodity' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '排序', example: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: '国际化key', example: 'route.product' })
  @IsString()
  @IsOptional()
  i18nKey?: string;

  @ApiPropertyOptional({
    description: '按钮权限JSON字符串',
    example: '[{"code":"product:add","desc":"添加商品"}]',
  })
  @IsString()
  @IsOptional()
  buttons?: string;

  @ApiPropertyOptional({ description: '状态', example: '1', enum: ['1', '0'] })
  @IsString()
  @IsOptional()
  status?: string;
}
