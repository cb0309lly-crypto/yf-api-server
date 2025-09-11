import { IsString, IsOptional, IsEnum, Length, MaxLength } from 'class-validator';
import { SystemStatus } from '../../entity/system';

export class UpdateSystemDto {
  @IsString({ message: '系统编号必须是字符串' })
  @Length(1, 50, { message: '系统编号不能为空' })
  no: string;

  @IsOptional()
  @IsString({ message: '系统名称必须是字符串' })
  @Length(1, 100, { message: '系统名称长度必须在1-100个字符之间' })
  name?: string;

  @IsOptional()
  @IsString({ message: '版本号必须是字符串' })
  @Length(1, 20, { message: '版本号长度必须在1-20个字符之间' })
  version?: string;

  @IsOptional()
  @IsString({ message: '物料编号必须是字符串' })
  @Length(1, 50, { message: '物料编号长度必须在1-50个字符之间' })
  materialNo?: string;

  @IsOptional()
  @IsString({ message: '设备名称必须是字符串' })
  @MaxLength(100, { message: '设备名称不能超过100个字符' })
  device?: string;

  @IsOptional()
  @IsString({ message: '操作员编号必须是字符串' })
  @Length(1, 50, { message: '操作员编号长度必须在1-50个字符之间' })
  operatorNo?: string;

  @IsOptional()
  @IsEnum(SystemStatus, { message: '系统状态值不正确' })
  status?: SystemStatus;
}
