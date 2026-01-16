import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { CartItemStatus } from '../../entity/cart';

export class UpdateCartDto {
  @IsString({ message: '购物车ID不能为空' })
  no: string;

  @IsOptional()
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(1, { message: '数量不能小于1' })
  @Max(999, { message: '数量不能超过999' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '单价必须是数字' })
  @Min(0, { message: '单价不能小于0' })
  @Max(999999.99, { message: '单价不能超过999999.99' })
  unitPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: '总价必须是数字' })
  @Min(0, { message: '总价不能小于0' })
  @Max(999999.99, { message: '总价不能超过999999.99' })
  totalPrice?: number;

  @IsOptional()
  @IsEnum(CartItemStatus, { message: '购物车项目状态值不正确' })
  status?: CartItemStatus;

  @IsOptional()
  selected?: boolean;
}
