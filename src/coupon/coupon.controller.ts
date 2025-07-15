import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() body) {
    return this.couponService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.couponService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.couponService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }

  @Get('user/:userId')
  getUserCoupons(@Param('userId') userId: string, @Query() query) {
    return this.couponService.getUserCoupons(userId, query);
  }

  @Post('validate')
  validateCoupon(@Body() body) {
    return this.couponService.validateCoupon(body);
  }

  @Post('use')
  useCoupon(@Body() body) {
    return this.couponService.useCoupon(body);
  }

  @Get('available/:userId')
  getAvailableCoupons(@Param('userId') userId: string, @Query() query) {
    return this.couponService.getAvailableCoupons(userId, query);
  }
} 