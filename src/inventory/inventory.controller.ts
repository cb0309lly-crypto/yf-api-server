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
import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryQueryDto,
  InventoryIdDto,
} from './dto';
import { PaginationResult } from '../common/utils/pagination.util';
import { Inventory } from '../entity/inventory';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('库存管理')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: '创建库存记录' })
  create(@Body() body: CreateInventoryDto) {
    return this.inventoryService.create(body);
  }

  @Get('list')
  @ApiOperation({ summary: '获取库存列表' })
  findAll(
    @Query() query: InventoryQueryDto,
  ): Promise<PaginationResult<Inventory>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      productNo,
      location,
      status,
      minQuantity,
      maxQuantity,
    } = query;
    return this.inventoryService.findAllPaged(
      page,
      pageSize,
      keyword,
      productNo,
      location,
      status,
      minQuantity,
      maxQuantity,
    );
  }

  @Get('low-stock/alerts')
  @ApiOperation({ summary: '获取低库存警报' })
  getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取库存详情' })
  findOne(@Param() params: InventoryIdDto) {
    return this.inventoryService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存记录' })
  update(@Param() params: InventoryIdDto, @Body() body: UpdateInventoryDto) {
    return this.inventoryService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存记录' })
  remove(@Param() params: InventoryIdDto) {
    return this.inventoryService.remove(params.id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '获取商品库存' })
  getProductInventory(@Param('productId') productId: string) {
    return this.inventoryService.getProductInventory(productId);
  }

  @Post(':id/restock')
  @ApiOperation({ summary: '补货' })
  restock(@Param() params: InventoryIdDto, @Body() body: { quantity: number }) {
    return this.inventoryService.restock(params.id, body.quantity);
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: '预留库存' })
  reserve(@Param() params: InventoryIdDto, @Body() body: { quantity: number }) {
    return this.inventoryService.reserve(params.id, body.quantity);
  }
}
