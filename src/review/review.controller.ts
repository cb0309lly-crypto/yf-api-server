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
import { ReviewService } from './review.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewIdDto,
} from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('评价管理')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ========== 需要登录的接口 ==========

  @Post()
  @ApiOperation({ summary: '创建评价（需要登录）' })
  create(@Body() body: CreateReviewDto) {
    return this.reviewService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新评价（需要登录）' })
  update(@Param() params: ReviewIdDto, @Body() body: UpdateReviewDto) {
    return this.reviewService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除评价（需要登录）' })
  remove(@Param() params: ReviewIdDto) {
    return this.reviewService.remove(params.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户评价（需要登录）' })
  getUserReviews(@Param('userId') userId: string, @Query() query: any) {
    return this.reviewService.getUserReviews(userId, query);
  }

  @Post(':id/helpful')
  @ApiOperation({ summary: '标记评价有用（需要登录）' })
  markHelpful(@Param() params: ReviewIdDto) {
    return this.reviewService.markHelpful(params.id);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: '回复评价（需要登录）' })
  addReply(@Param() params: ReviewIdDto, @Body() body: any) {
    return this.reviewService.addReply(params.id, body);
  }

  // ========== 小程序端接口（开放访问）==========

  @Public()
  @Get('/list')
  @ApiOperation({ summary: '获取评价列表（小程序端-无需登录）' })
  findAll(@Query() query: ReviewQueryDto) {
    return this.reviewService.findAll(query);
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: '获取商品评价（小程序端-无需登录）' })
  getProductReviews(
    @Param('productId') productId: string,
    @Query() query: any,
  ) {
    return this.reviewService.getProductReviews(productId, query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取评价详情（小程序端-无需登录）' })
  findOne(@Param() params: ReviewIdDto) {
    return this.reviewService.findOne(params.id);
  }
}
