import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto, WishlistQueryDto, WishlistIdDto } from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('收藏夹管理')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: '创建收藏记录' })
  create(@Body() body: CreateWishlistDto) {
    return this.wishlistService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取收藏列表' })
  findAll(@Query() query: WishlistQueryDto) {
    return this.wishlistService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取收藏详情' })
  findOne(@Param() params: WishlistIdDto) {
    return this.wishlistService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新收藏记录' })
  update(@Param() params: WishlistIdDto, @Body() body: any) {
    return this.wishlistService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除收藏记录' })
  remove(@Param() params: WishlistIdDto) {
    return this.wishlistService.remove(params.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户收藏夹' })
  getUserWishlist(@Param('userId') userId: string, @Query() query: any) {
    return this.wishlistService.getUserWishlist(userId, query);
  }

  @Post('add')
  @ApiOperation({ summary: '添加到收藏夹' })
  addToWishlist(@Body() body: any) {
    return this.wishlistService.addToWishlist(body);
  }

  @Post('remove')
  @ApiOperation({ summary: '从收藏夹移除' })
  removeFromWishlist(@Body() body: any) {
    return this.wishlistService.removeFromWishlist(body);
  }

  @Post('clear')
  @ApiOperation({ summary: '清空收藏夹' })
  clearWishlist(@Body() body: { userNo: string }) {
    return this.wishlistService.clearWishlist(body.userNo);
  }

  @Post('check')
  @ApiOperation({ summary: '检查是否已收藏' })
  checkInWishlist(@Body() body: any) {
    return this.wishlistService.checkInWishlist(body);
  }
}
