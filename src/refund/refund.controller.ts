import { Controller, Post, Body, Param, Get, Query, Put, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { AuditRefundDto } from './dto/audit-refund.dto';

@ApiTags('售后/退款')
@ApiBearerAuth()
@Controller('refund')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post('apply')
  @ApiOperation({ summary: '申请退款 (用户)' })
  async apply(@Request() req, @Body() dto: CreateRefundDto) {
    return this.refundService.create(req.user.no, dto);
  }

  @Put('audit/:refundNo')
  @ApiOperation({ summary: '审核退款 (管理员)' })
  async audit(@Param('refundNo') refundNo: string, @Body() dto: AuditRefundDto) {
    return this.refundService.audit(refundNo, dto);
  }

  @Get('list')
  @ApiOperation({ summary: '退款列表 (管理员)' })
  async list(@Query() query) {
    const { page, pageSize, status } = query;
    return this.refundService.findAll(Number(page) || 1, Number(pageSize) || 10, status);
  }
}
