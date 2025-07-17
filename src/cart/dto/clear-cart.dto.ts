import { IsString, IsNotEmpty } from 'class-validator';

export class ClearCartDto {
  @IsString({ message: '用户编号不能为空' })
  @IsNotEmpty({ message: '用户编号不能为空' })
  userNo: string;
} 