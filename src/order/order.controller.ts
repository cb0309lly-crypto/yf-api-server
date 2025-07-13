import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

@Controller('order')
export class OrderController {
  @Post()
  addOrder(@Body() body) {
    return 'order';
  }

  @Put()
  editOrder(@Body() body) {
    return 'order';
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return 'order';
  }

  @Get('/list')
  getList() {
    return 'order';
  }
}
