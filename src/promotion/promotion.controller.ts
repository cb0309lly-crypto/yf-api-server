import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { PromotionService } from './promotion.service';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() body) {
    return this.promotionService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.promotionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.promotionService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }

  @Get('active/list')
  getActivePromotions(@Query() query) {
    return this.promotionService.getActivePromotions(query);
  }

  @Post(':id/activate')
  activatePromotion(@Param('id') id: string) {
    return this.promotionService.activatePromotion(id);
  }

  @Post(':id/pause')
  pausePromotion(@Param('id') id: string) {
    return this.promotionService.pausePromotion(id);
  }

  @Get('product/:productId')
  getProductPromotions(@Param('productId') productId: string) {
    return this.promotionService.getProductPromotions(productId);
  }
} 