import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../entity/order';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
  OrderIdDto,
} from './dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  addOrder(
    @Body(ValidationPipe) body: CreateOrderDto,
    @Request() req,
  ): Promise<Order> {
    // 从用户上下文中获取 user_no
    const orderData = {
      ...body,
      userNo: req.user.no,
    };
    return this.orderService.addOrder(orderData);
  }

  @Put()
  editOrder(@Body(ValidationPipe) body: UpdateOrderDto): Promise<Order> {
    return this.orderService.updateOrder(body);
  }

  @Get('/list')
  getPagedList(@Query(ValidationPipe) query: OrderQueryDto) {
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

  @Get(':id')
  getOne(@Param(ValidationPipe) params: OrderIdDto): Promise<Order | null> {
    return this.orderService.findOne(params.id);
  }
}
