import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CategoryStatus } from '../../entity/category';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '父分类编号必须是字符串' })
  parentId?: string;

  @IsOptional()
  @IsEnum(CategoryStatus, { message: '分类状态值不正确' })
  status?: CategoryStatus;

  @IsOptional()
  @IsString({ message: '分类图标必须是字符串' })
  icon?: string;

  @IsOptional()
  sort?: number;
}
