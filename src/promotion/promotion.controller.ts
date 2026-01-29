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
import { PromotionService } from './promotion.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  PromotionQueryDto,
  PromotionIdDto,
} from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('促销管理')
@ApiBearerAuth()
@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  // ========== 管理端接口（需要鉴权）==========

  @Post()
  @ApiOperation({ summary: '创建促销活动（管理端）' })
  create(@Body() body: CreatePromotionDto) {
    return this.promotionService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取促销活动列表（管理端）' })
  findAll(@Query() query: PromotionQueryDto) {
    return this.promotionService.findAll(query);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新促销活动（管理端）' })
  update(@Param() params: PromotionIdDto, @Body() body: UpdatePromotionDto) {
    return this.promotionService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除促销活动（管理端）' })
  remove(@Param() params: PromotionIdDto) {
    return this.promotionService.remove(params.id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '启用促销活动（管理端）' })
  activatePromotion(@Param() params: PromotionIdDto) {
    return this.promotionService.activatePromotion(params.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: '暂停促销活动（管理端）' })
  pausePromotion(@Param() params: PromotionIdDto) {
    return this.promotionService.pausePromotion(params.id);
  }

  // ========== 小程序端接口（开放访问）==========

  @Public()
  @Get('active/list')
  @ApiOperation({ summary: '获取当前活跃的促销活动（小程序端-无需登录）' })
  getActivePromotions(@Query() query: any) {
    return this.promotionService.getActivePromotions(query);
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: '获取商品关联的促销活动（小程序端-无需登录）' })
  getProductPromotions(@Param('productId') productId: string) {
    return this.promotionService.getProductPromotions(productId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取促销活动详情（小程序端-无需登录）' })
  findOne(@Param() params: PromotionIdDto) {
    return this.promotionService.findOne(params.id);
  }
}
