import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto, CouponQueryDto, CouponIdDto } from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('优惠券管理')
@ApiBearerAuth()
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @ApiOperation({ summary: '创建优惠券' })
  create(@Body() body: CreateCouponDto) {
    return this.couponService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取优惠券列表' })
  findAll(@Query() query: CouponQueryDto) {
    return this.couponService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取优惠券详情' })
  findOne(@Param() params: CouponIdDto) {
    return this.couponService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新优惠券' })
  update(@Param() params: CouponIdDto, @Body() body: UpdateCouponDto) {
    return this.couponService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除优惠券' })
  remove(@Param() params: CouponIdDto) {
    return this.couponService.remove(params.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户优惠券' })
  getUserCoupons(@Param('userId') userId: string, @Query() query: any) {
    return this.couponService.getUserCoupons(userId, query);
  }

  @Post('validate')
  @ApiOperation({ summary: '验证优惠券' })
  validateCoupon(@Body() body: any) {
    return this.couponService.validateCoupon(body);
  }

  @Post('use')
  @ApiOperation({ summary: '使用优惠券' })
  useCoupon(@Body() body: any) {
    return this.couponService.useCoupon(body);
  }

  @Get('available/:userId')
  @ApiOperation({ summary: '获取用户可用优惠券' })
  getAvailableCoupons(@Param('userId') userId: string, @Query() query: any) {
    return this.couponService.getAvailableCoupons(userId, query);
  }
}
