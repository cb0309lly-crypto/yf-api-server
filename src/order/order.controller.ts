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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('订单管理')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  addOrder(
    @Body() body: CreateOrderDto,
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
  @ApiOperation({ summary: '更新订单' })
  editOrder(@Body() body: UpdateOrderDto): Promise<Order> {
    return this.orderService.updateOrder(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取订单列表' })
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

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  getOne(@Param() params: OrderIdDto): Promise<Order | null> {
    return this.orderService.findOne(params.id);
  }
}
