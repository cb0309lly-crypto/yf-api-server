import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CategoryStatus } from '../../entity/category';

export class UpdateCategoryDto {
  @IsString({ message: '分类编号不能为空' })
  no: string;

  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '父分类编号必须是字符串' })
  parentNo?: string;

  @IsOptional()
  @IsEnum(CategoryStatus, { message: '分类状态值不正确' })
  status?: CategoryStatus;

  @IsOptional()
  @IsString({ message: '分类图标必须是字符串' })
  icon?: string;

  @IsOptional()
  @IsString({ message: '分类图片必须是字符串' })
  image?: string;
} 