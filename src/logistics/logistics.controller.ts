import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';

@Controller('logistics')
export class LogisticsController {
  @Post()
  addLogistics(@Body() body) {
    return 'logistics';
  }

  @Put()
  editLogistics(@Body() body) {
    return 'logistics';
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return 'logistics';
  }

  @Get('/list')
  getList() {
    return 'logistics';
  }
}
