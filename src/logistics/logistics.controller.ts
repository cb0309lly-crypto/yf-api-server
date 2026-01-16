import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Logistics } from '../entity/logistics';
import { LogisticsService } from './logistics.service';
import {
  CreateLogisticsDto,
  UpdateLogisticsDto,
  QueryLogisticsDto,
  LogisticsIdDto,
} from './dto';
import { PaginationResult } from '../common/utils/pagination.util';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('物流管理')
@ApiBearerAuth()
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  @ApiOperation({ summary: '创建物流记录' })
  addLogistics(
    @Body() createLogisticsDto: CreateLogisticsDto,
  ): Promise<Logistics> {
    return this.logisticsService.createLogistic(createLogisticsDto);
  }

  @Put()
  @ApiOperation({ summary: '更新物流记录' })
  editLogistics(
    @Body() updateLogisticsDto: UpdateLogisticsDto,
  ): Promise<Logistics> {
    return this.logisticsService.updateLogistics(updateLogisticsDto);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取物流列表' })
  getList(
    @Query() queryLogisticsDto: QueryLogisticsDto,
  ): Promise<PaginationResult<Logistics>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      name,
      senderNo,
      receiverNo,
      orderNo,
      currentStatus,
      receive_time,
    } = queryLogisticsDto;
    return this.logisticsService.findAllPaged(
      page,
      pageSize,
      keyword || name,
      senderNo,
      receiverNo,
      orderNo,
      currentStatus,
      receive_time,
    );
  }

  @Get('/:id')
  @ApiOperation({ summary: '获取物流详情' })
  getOne(@Param() params: LogisticsIdDto): Promise<Logistics | null> {
    return this.logisticsService.findOne(params.id);
  }
}
