import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto, PromotionQueryDto, PromotionIdDto } from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('促销管理')
@ApiBearerAuth()
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @ApiOperation({ summary: '创建促销活动' })
  create(@Body() body: CreatePromotionDto) {
    return this.promotionService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取促销活动列表' })
  findAll(@Query() query: PromotionQueryDto) {
    return this.promotionService.findAll(query);
  }

  @Get('active/list')
  @ApiOperation({ summary: '获取当前活跃的促销活动' })
  getActivePromotions(@Query() query: any) {
    return this.promotionService.getActivePromotions(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取促销活动详情' })
  findOne(@Param() params: PromotionIdDto) {
    return this.promotionService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新促销活动' })
  update(@Param() params: PromotionIdDto, @Body() body: UpdatePromotionDto) {
    return this.promotionService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除促销活动' })
  remove(@Param() params: PromotionIdDto) {
    return this.promotionService.remove(params.id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '启用促销活动' })
  activatePromotion(@Param() params: PromotionIdDto) {
    return this.promotionService.activatePromotion(params.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: '暂停促销活动' })
  pausePromotion(@Param() params: PromotionIdDto) {
    return this.promotionService.pausePromotion(params.id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '获取商品关联的促销活动' })
  getProductPromotions(@Param('productId') productId: string) {
    return this.promotionService.getProductPromotions(productId);
  }
}
