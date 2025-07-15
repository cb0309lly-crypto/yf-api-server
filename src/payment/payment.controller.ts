import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() body) {
    return this.paymentService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.paymentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.paymentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }

  @Get('order/:orderId')
  getOrderPayments(@Param('orderId') orderId: string) {
    return this.paymentService.getOrderPayments(orderId);
  }

  @Post('process')
  processPayment(@Body() body) {
    return this.paymentService.processPayment(body);
  }

  @Post('refund')
  refundPayment(@Body() body) {
    return this.paymentService.refundPayment(body);
  }

  @Get('user/:userId')
  getUserPayments(@Param('userId') userId: string, @Query() query) {
    return this.paymentService.getUserPayments(userId, query);
  }
} 