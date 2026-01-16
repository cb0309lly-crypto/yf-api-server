import { IsString, IsNotEmpty } from 'class-validator';

export class InventoryIdDto {
  @IsString({ message: '库存ID必须是字符串' })
  @IsNotEmpty({ message: '库存ID不能为空' })
  id: string;
}
