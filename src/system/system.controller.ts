import { Controller, Post, Body, Put, Get, Param } from '@nestjs/common';
import { SystemService } from './system.service';
import { System } from '../entity/system';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post()
  async createSystem(@Body() data: Partial<System>): Promise<System> {
    return this.systemService.createSystem(data);
  }
  @Put()
  async updateSystem(@Body() data: Partial<System>): Promise<System | null> {
    return this.systemService.updateSystem(data);
  }
  @Get('/list')
  async getList() {
    return this.systemService.findAll()
  }
  @Get('/:no')
  async getOne(@Param('no') no: string): Promise<System | null> {
    return this.systemService.findOne(no);
  }
}
