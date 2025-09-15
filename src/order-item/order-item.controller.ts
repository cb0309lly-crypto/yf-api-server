import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { OrderItemService } from './order-item.service';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  create(@Body() body) {
    return this.orderItemService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.orderItemService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.orderItemService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderItemService.remove(id);
  }

  @Get('order/:orderId')
  getOrderItems(@Param('orderId') orderId: string) {
    return this.orderItemService.getOrderItems(orderId);
  }

  @Post('batch')
  createBatch(@Body() body,@Request() req,) {
    return this.orderItemService.createBatch(body, req.user.no);
  }
} 