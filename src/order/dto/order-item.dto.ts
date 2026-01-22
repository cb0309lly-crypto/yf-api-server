import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: '商品编号', example: 'PROD-001' })
  @IsNotEmpty({ message: '商品编号不能为空' })
  @IsString({ message: '商品编号必须是字符串' })
  productNo: string;

  @ApiProperty({ description: '购买数量', example: 2, minimum: 1 })
  @IsNotEmpty({ message: '购买数量不能为空' })
  @IsNumber({}, { message: '购买数量必须是数字' })
  @Min(1, { message: '购买数量不能小于1' })
  @Max(9999, { message: '购买数量不能超过9999' })
  quantity: number;

  @ApiProperty({
    description: '商品单价',
    example: 99.99,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '商品单价必须是数字' })
  @Min(0, { message: '商品单价不能小于0' })
  @Max(999999.99, { message: '商品单价不能超过999999.99' })
  price?: number;
}
