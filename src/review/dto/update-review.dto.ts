import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ReviewStatus } from '../../entity/review';

export class UpdateReviewDto {
  @IsString({ message: '评价编号不能为空' })
  no: string;

  @IsOptional()
  @IsNumber({}, { message: '评分必须是数字' })
  @Min(1, { message: '评分不能小于1' })
  @Max(5, { message: '评分不能超过5' })
  rating?: number;

  @IsOptional()
  @IsString({ message: '评价标题必须是字符串' })
  title?: string;

  @IsOptional()
  @IsString({ message: '评价内容必须是字符串' })
  content?: string;

  @IsOptional()
  @IsEnum(ReviewStatus, { message: '评价状态值不正确' })
  status?: ReviewStatus;

  @IsOptional()
  @IsString({ message: '管理员回复必须是字符串' })
  adminReply?: string;

  @IsOptional()
  @IsArray({ message: '图片必须是数组' })
  images?: string[];
}
