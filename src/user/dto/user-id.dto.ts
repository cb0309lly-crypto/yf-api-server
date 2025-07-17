import { IsString, IsNotEmpty } from 'class-validator';

export class UserIdDto {
  @IsString({ message: '用户ID必须是字符串' })
  @IsNotEmpty({ message: '用户ID不能为空' })
  id: string;
} 