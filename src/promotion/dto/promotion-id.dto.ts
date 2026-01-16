import { IsString, IsNotEmpty } from 'class-validator';

export class PromotionIdDto {
  @IsString({ message: '促销活动ID必须是字符串' })
  @IsNotEmpty({ message: '促销活动ID不能为空' })
  id: string;
}
