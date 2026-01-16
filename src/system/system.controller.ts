import { Controller, Post, Body, Put, Get, Param, Query } from '@nestjs/common';
import { SystemService } from './system.service';
import { System } from '../entity/system';
import {
  CreateSystemDto,
  UpdateSystemDto,
  QuerySystemDto,
  SystemIdDto,
} from './dto';
import { PaginationResult } from '../common/utils/pagination.util';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('系统管理')
@ApiBearerAuth()
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post()
  @ApiOperation({ summary: '创建系统配置' })
  async createSystem(
    @Body() createSystemDto: CreateSystemDto,
  ): Promise<System> {
    return this.systemService.createSystem(createSystemDto);
  }

  @Put()
  @ApiOperation({ summary: '更新系统配置' })
  async updateSystem(
    @Body() updateSystemDto: UpdateSystemDto,
  ): Promise<System | null> {
    return this.systemService.updateSystem(updateSystemDto);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取系统配置列表' })
  async getList(
    @Query() querySystemDto: QuerySystemDto,
  ): Promise<PaginationResult<System>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      name,
      version,
      material,
      device,
      operatorNo,
      status,
    } = querySystemDto;
    return this.systemService.findAllPaged(
      page,
      pageSize,
      keyword || name,
      version,
      material,
      device,
      operatorNo,
      status,
    );
  }

  @Get('/:no')
  @ApiOperation({ summary: '获取系统配置详情' })
  async getOne(@Param() params: SystemIdDto): Promise<System | null> {
    return this.systemService.findOne(params.no);
  }
}
