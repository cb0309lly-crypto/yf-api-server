import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CategoryStatus } from '../../entity/category';

export class CreateCategoryDto {
  @IsString({ message: '分类名称不能为空' })
  name: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '父分类编号必须是字符串' })
  parentId?: string;

  @IsOptional()
  @IsEnum(CategoryStatus, { message: '分类状态值不正确' })
  status?: CategoryStatus = CategoryStatus.ACTIVE;

  @IsOptional()
  @IsString({ message: '分类图标必须是字符串' })
  icon?: string;

  @IsOptional()
  sort?: number;
}
