import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(@Body() body) {
    return this.wishlistService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.wishlistService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.wishlistService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(id);
  }

  @Get('user/:userId')
  getUserWishlist(@Param('userId') userId: string, @Query() query) {
    return this.wishlistService.getUserWishlist(userId, query);
  }

  @Post('add')
  addToWishlist(@Body() body) {
    return this.wishlistService.addToWishlist(body);
  }

  @Post('remove')
  removeFromWishlist(@Body() body) {
    return this.wishlistService.removeFromWishlist(body);
  }

  @Post('clear')
  clearWishlist(@Body() body) {
    return this.wishlistService.clearWishlist(body.userNo);
  }

  @Post('check')
  checkInWishlist(@Body() body) {
    return this.wishlistService.checkInWishlist(body);
  }
} 