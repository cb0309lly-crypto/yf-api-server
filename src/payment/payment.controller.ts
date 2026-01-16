import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryDto,
  PaymentIdDto,
} from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('支付管理')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: '创建支付记录' })
  create(@Body() body: CreatePaymentDto) {
    return this.paymentService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取支付列表' })
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取支付详情' })
  findOne(@Param() params: PaymentIdDto) {
    return this.paymentService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新支付记录' })
  update(@Param() params: PaymentIdDto, @Body() body: UpdatePaymentDto) {
    return this.paymentService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除支付记录' })
  remove(@Param() params: PaymentIdDto) {
    return this.paymentService.remove(params.id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '获取订单支付记录' })
  getOrderPayments(@Param('orderId') orderId: string) {
    return this.paymentService.getOrderPayments(orderId);
  }

  @Post('process')
  @ApiOperation({ summary: '处理支付' })
  processPayment(@Body() body: any) {
    return this.paymentService.processPayment(body);
  }

  @Post('refund')
  @ApiOperation({ summary: '处理退款' })
  refundPayment(@Body() body: any) {
    return this.paymentService.refundPayment(body);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户支付记录' })
  getUserPayments(@Param('userId') userId: string, @Query() query: any) {
    return this.paymentService.getUserPayments(userId, query);
  }
}
