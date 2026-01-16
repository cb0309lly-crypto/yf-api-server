import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { CouponType, CouponStatus } from '../../entity/coupon';

export class UpdateCouponDto {
  @IsString({ message: '优惠券编号不能为空' })
  no: string;

  @IsOptional()
  @IsEnum(CouponType, { message: '优惠券类型值不正确' })
  type?: CouponType;

  @IsOptional()
  @IsNumber({}, { message: '优惠券面值必须是数字' })
  @Min(0, { message: '优惠券面值不能小于0' })
  @Max(999999.99, { message: '优惠券面值不能超过999999.99' })
  value?: number;

  @IsOptional()
  @IsNumber({}, { message: '最低消费金额必须是数字' })
  @Min(0, { message: '最低消费金额不能小于0' })
  @Max(999999.99, { message: '最低消费金额不能超过999999.99' })
  minimumAmount?: number;

  @IsOptional()
  @IsEnum(CouponStatus, { message: '优惠券状态值不正确' })
  status?: CouponStatus;

  @IsOptional()
  @IsDateString({}, { message: '生效时间格式不正确' })
  validFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: '失效时间格式不正确' })
  validUntil?: string;

  @IsOptional()
  @IsNumber({}, { message: '使用限制必须是数字' })
  @Min(1, { message: '使用限制不能小于1' })
  @Max(999999, { message: '使用限制不能超过999999' })
  usageLimit?: number;

  @IsOptional()
  @IsString({ message: '优惠券代码必须是字符串' })
  code?: string;

  @IsOptional()
  @IsString({ message: '优惠券描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsArray({ message: '适用商品必须是数组' })
  applicableProducts?: string[];

  @IsOptional()
  @IsArray({ message: '适用分类必须是数组' })
  applicableCategories?: string[];

  @IsOptional()
  @IsBoolean({ message: '是否全局优惠券必须是布尔值' })
  isGlobal?: boolean;
}
