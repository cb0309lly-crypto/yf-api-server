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
  addOrder(@Body() body: CreateOrderDto, @Request() req): Promise<Order> {
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
      keyword,
      userNo,
      orderStatus,
      operatorNo,
      customerNo,
    } = query;
    return this.orderService.findAllPaged(
      page,
      pageSize,
      keyword,
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

  @Get('mp/list')
  @ApiOperation({ summary: '获取小程序订单列表' })
  async getMpOrderList(@Query() query: any) {
    const { pageNum = 1, pageSize = 10, orderStatus, userNo } = query;
    return this.orderService.getMpOrderList({
      pageNum: Number(pageNum) || 1,
      pageSize: Number(pageSize) || 10,
      orderStatus: orderStatus !== undefined ? Number(orderStatus) : undefined,
      userNo,
    });
  }

  @Get('mp/count')
  @ApiOperation({ summary: '获取小程序订单统计' })
  async getMpOrderCount(@Query('userNo') userNo?: string) {
    return this.orderService.getMpOrderCount(userNo);
  }

  @Get('mp/detail/:orderNo')
  @ApiOperation({ summary: '获取小程序订单详情' })
  async getMpOrderDetail(@Param('orderNo') orderNo: string) {
    return this.orderService.getMpOrderDetail(orderNo);
  }

  @Post('settle')
  @ApiOperation({ summary: '获取小程序结算数据' })
  async getSettleDetail(@Body() body: any) {
    return this.orderService.getSettleDetail(body);
  }

  @Post('commit-pay')
  @ApiOperation({ summary: '小程序提交支付' })
  async commitPay(@Body() body: any) {
    return this.orderService.commitPay(body);
  }

  @Get('business-time')
  @ApiOperation({ summary: '获取小程序客服信息' })
  async getBusinessTime() {
    return this.orderService.getBusinessTime();
  }
}
