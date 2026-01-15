import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto, OrderItemQueryDto, OrderItemIdDto } from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('订单项管理')
@ApiBearerAuth()
@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  @ApiOperation({ summary: '创建订单项' })
  create(@Body() body: CreateOrderItemDto) {
    return this.orderItemService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取订单项列表' })
  findAll(@Query() query: OrderItemQueryDto) {
    return this.orderItemService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单项详情' })
  findOne(@Param() params: OrderItemIdDto) {
    return this.orderItemService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新订单项' })
  update(@Param() params: OrderItemIdDto, @Body() body: any) {
    return this.orderItemService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单项' })
  remove(@Param() params: OrderItemIdDto) {
    return this.orderItemService.remove(params.id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '获取订单的所有订单项' })
  getOrderItems(@Param('orderId') orderId: string) {
    return this.orderItemService.getOrderItems(orderId);
  }

  @Post('batch')
  @ApiOperation({ summary: '批量创建订单项' })
  createBatch(@Body() body: CreateOrderItemDto[], @Request() req) {
    return this.orderItemService.createBatch(body, req.user.no);
  }
}
