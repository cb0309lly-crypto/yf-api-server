import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Logistics } from '../entity/logistics';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  addLogistics(@Body() body: Partial<Logistics>): Promise<Logistics> {
    return this.logisticsService.createLogistic(body);
  }

  @Put()
  editLogistics(@Body() body: Partial<Logistics>): Promise<Logistics> {
    return this.logisticsService.updateLogistics(body);
  }

  @Get('/:id')
  getOne(@Param('id') id: string): Promise<Logistics | null> {
    return this.logisticsService.findOne(id);
  }

  @Get('/list')
  getList(): Promise<Logistics[]> {
    return this.logisticsService.findAll();
  }
}
