import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Body() body) {
    return this.reviewService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.reviewService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.reviewService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }

  @Get('product/:productId')
  getProductReviews(@Param('productId') productId: string, @Query() query) {
    return this.reviewService.getProductReviews(productId, query);
  }

  @Get('user/:userId')
  getUserReviews(@Param('userId') userId: string, @Query() query) {
    return this.reviewService.getUserReviews(userId, query);
  }

  @Post(':id/helpful')
  markHelpful(@Param('id') id: string) {
    return this.reviewService.markHelpful(id);
  }

  @Post(':id/reply')
  addReply(@Param('id') id: string, @Body() body) {
    return this.reviewService.addReply(id, body);
  }
} 