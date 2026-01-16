import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { RefundStatus } from '../../entity/refund';

export class AuditRefundDto {
  @IsNotEmpty()
  @IsEnum(RefundStatus)
  status: RefundStatus; // APPROVED or REJECTED

  @IsOptional()
  @IsString()
  adminRemark?: string;
}
