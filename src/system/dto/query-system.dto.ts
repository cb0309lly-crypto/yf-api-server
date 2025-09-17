import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SystemStatus } from '../../entity/system';

export class QuerySystemDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '系统名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '版本号必须是字符串' })
  version?: string;

  @IsOptional()
  @IsString({ message: '物料编号必须是字符串' })
  material?: string;

  @IsOptional()
  @IsString({ message: '设备名称必须是字符串' })
  device?: string;

  @IsOptional()
  @IsString({ message: '操作员编号必须是字符串' })
  operatorNo?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(SystemStatus, { message: '系统状态值不正确' })
  status?: SystemStatus;

  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;
}
