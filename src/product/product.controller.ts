import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';

@Controller('product')
export class ProductController {
  @Post()
  addProduct(@Body() body) {
    return 'product';
  }

  @Put()
  editProduct(@Body() body) {
    return 'product';
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return 'product';
  }

  @Get('/list')
  getList() {
    return 'product';
  }
}
