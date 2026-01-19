import { IsString, IsNotEmpty, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class CreateDeploymentDto {
  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  ossUrl: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
