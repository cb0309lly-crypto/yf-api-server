import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { PaginationResult } from '../common/utils/pagination.util';
import { Inventory } from '../entity/inventory';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() body) {
    return this.inventoryService.create(body);
  }

  @Get('list')
  findAll(@Query() query: InventoryQueryDto): Promise<PaginationResult<Inventory>> {
    const { page = 1, pageSize = 10, keyword, productNo, location, status, minQuantity, maxQuantity } = query;
    return this.inventoryService.findAllPaged(page, pageSize, keyword, productNo, location, status, minQuantity, maxQuantity);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.inventoryService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Get('product/:productId')
  getProductInventory(@Param('productId') productId: string) {
    return this.inventoryService.getProductInventory(productId);
  }

  @Post(':id/restock')
  restock(@Param('id') id: string, @Body() body) {
    return this.inventoryService.restock(id, body.quantity);
  }

  @Post(':id/reserve')
  reserve(@Param('id') id: string, @Body() body) {
    return this.inventoryService.reserve(id, body.quantity);
  }

  @Get('low-stock/alerts')
  getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }
} 