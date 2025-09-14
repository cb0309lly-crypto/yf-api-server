import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../entity/order';
import { OrderQueryDto } from './dto/order-query.dto';

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
  getPagedList(@Query() query: OrderQueryDto) {
    const {
      page = 1,
      pageSize = 10,
      userNo,
      orderStatus,
      operatorNo,
      customerNo,
    } = query;
    return this.orderService.findAllPaged(
      page,
      pageSize,
      undefined, // keyword 暂时不传递，可以根据需要添加
      userNo,
      orderStatus as any,
      operatorNo,
      customerNo,
    );
  }
}
