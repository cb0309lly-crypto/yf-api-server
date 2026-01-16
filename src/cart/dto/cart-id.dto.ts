import { IsString, IsNotEmpty } from 'class-validator';

export class CartIdDto {
  @IsString({ message: '购物车ID必须是字符串' })
  @IsNotEmpty({ message: '购物车ID不能为空' })
  id: string;
}
