import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() body) {
    return this.cartService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.cartService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.cartService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }

  @Get('user/:userId')
  getUserCart(@Param('userId') userId: string) {
    return this.cartService.getUserCart(userId);
  }

  @Post('add')
  addToCart(@Body() body) {
    return this.cartService.addToCart(body);
  }

  @Post('remove')
  removeFromCart(@Body() body) {
    return this.cartService.removeFromCart(body);
  }

  @Post('clear')
  clearCart(@Body() body) {
    return this.cartService.clearCart(body.userNo);
  }

  @Post('update-quantity')
  updateQuantity(@Body() body) {
    return this.cartService.updateQuantity(body);
  }
} 