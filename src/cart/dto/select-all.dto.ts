import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class SelectAllDto {
  @IsString({ message: '用户编号不能为空' })
  @IsNotEmpty({ message: '用户编号不能为空' })
  userNo: string;

  @IsBoolean({ message: '选中状态必须是布尔值' })
  isSelected: boolean;
}
