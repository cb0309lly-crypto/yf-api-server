import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { PromotionType, PromotionStatus } from '../../entity/promotion';

export class CreatePromotionDto {
  @IsString({ message: '促销活动名称不能为空' })
  name: string;

  @IsOptional()
  @IsString({ message: '促销活动描述必须是字符串' })
  description?: string;

  @IsEnum(PromotionType, { message: '促销类型值不正确' })
  type: PromotionType;

  @IsNumber({}, { message: '折扣值必须是数字' })
  @Min(0, { message: '折扣值不能小于0' })
  @Max(100, { message: '折扣值不能超过100' })
  discountValue: number;

  @IsDateString({}, { message: '开始时间格式不正确' })
  startDate: string;

  @IsDateString({}, { message: '结束时间格式不正确' })
  endDate: string;

  @IsOptional()
  @IsEnum(PromotionStatus, { message: '促销状态值不正确' })
  status?: PromotionStatus = PromotionStatus.DRAFT;

  @IsOptional()
  @IsBoolean({ message: '是否激活必须是布尔值' })
  isActive?: boolean = false;

  @IsOptional()
  @IsString({ message: '适用商品必须是字符串' })
  applicableProducts?: string;

  @IsOptional()
  @IsString({ message: '适用分类必须是字符串' })
  applicableCategories?: string;
} 