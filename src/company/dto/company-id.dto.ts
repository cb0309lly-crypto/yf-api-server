import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CompanyIdDto {
  @IsString({ message: '公司编号必须是字符串' })
  @IsNotEmpty({ message: '公司编号不能为空' })
  @Length(1, 50, { message: '公司编号长度必须在1-50个字符之间' })
  id: string;
}
