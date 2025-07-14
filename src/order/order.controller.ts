import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../entity/order';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  addOrder(@Body() body: Partial<Order>): Promise<Order> {
    return this.orderService.addOrder(body);
  }

  @Put()
  editOrder(@Body() body: Partial<Order>): Promise<Order> {
    return this.orderService.updateOrder(body);
  }

  @Get('/:id')
  getOne(@Param('id') id: string): Promise<Order | null> {
    return this.orderService.findOne(id);
  }

  @Get('/list')
  getList() {
    return this.orderService.findAll();
  }
}
