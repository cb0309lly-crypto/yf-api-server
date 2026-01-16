import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateQuantityDto {
  @IsString({ message: '购物车ID不能为空' })
  @IsNotEmpty({ message: '购物车ID不能为空' })
  no: string;

  @IsNumber({}, { message: '数量必须是数字' })
  @Min(1, { message: '数量不能小于1' })
  @Max(999, { message: '数量不能超过999' })
  quantity: number;
}
