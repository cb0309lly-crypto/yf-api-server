import { Controller, Post, Body, Put, Get, Param, Query, UsePipes } from '@nestjs/common';
import { SystemService } from './system.service';
import { System } from '../entity/system';
import { CreateSystemDto, UpdateSystemDto, QuerySystemDto, SystemIdDto } from './dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { PaginationResult } from '../common/utils/pagination.util';

@Controller('system')
@UsePipes(new ValidationPipe())
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post()
  async createSystem(@Body() createSystemDto: CreateSystemDto): Promise<System> {
    return this.systemService.createSystem(createSystemDto);
  }
  
  @Put()
  async updateSystem(@Body() updateSystemDto: UpdateSystemDto): Promise<System | null> {
    return this.systemService.updateSystem(updateSystemDto);
  }
  
  @Get('/list')
  async getList(@Query() querySystemDto: QuerySystemDto): Promise<PaginationResult<System>> {
    const { page = 1, pageSize = 10, keyword, name, version, material, device, operatorNo, status } = querySystemDto;
    return this.systemService.findAllPaged(page, pageSize, keyword || name, version, material, device, operatorNo, status);
  }
  
  @Get('/:no')
  async getOne(@Param() params: SystemIdDto): Promise<System | null> {
    return this.systemService.findOne(params.no);
  }
}
