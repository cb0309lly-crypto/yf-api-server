import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { NotificationType, NotificationStatus } from '../../entity/notification';

export class CreateNotificationDto {
  @IsString({ message: '用户编号不能为空' })
  @IsNotEmpty({ message: '用户编号不能为空' })
  userNo: string;

  @IsString({ message: '通知标题不能为空' })
  @IsNotEmpty({ message: '通知标题不能为空' })
  title: string;

  @IsOptional()
  @IsString({ message: '通知内容必须是字符串' })
  content?: string;

  @IsEnum(NotificationType, { message: '通知类型值不正确' })
  type: NotificationType;

  @IsOptional()
  @IsEnum(NotificationStatus, { message: '通知状态值不正确' })
  status?: NotificationStatus;

  @IsOptional()
  @IsString({ message: '相关链接必须是字符串' })
  link?: string;
} 