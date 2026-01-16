import { IsString, IsNotEmpty } from 'class-validator';

export class NotificationIdDto {
  @IsString({ message: '通知ID必须是字符串' })
  @IsNotEmpty({ message: '通知ID不能为空' })
  id: string;
}
