import { Body, Controller, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { Logistics } from '../entity/logistics';
import { LogisticsService } from './logistics.service';
import { CreateLogisticsDto, UpdateLogisticsDto, QueryLogisticsDto, LogisticsIdDto } from './dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { PaginationResult } from '../common/utils/pagination.util';

@Controller('logistics')
@UsePipes(new ValidationPipe())
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  addLogistics(@Body() createLogisticsDto: CreateLogisticsDto): Promise<Logistics> {
    return this.logisticsService.createLogistic(createLogisticsDto);
  }

  @Put()
  editLogistics(@Body() updateLogisticsDto: UpdateLogisticsDto): Promise<Logistics> {
    return this.logisticsService.updateLogistics(updateLogisticsDto);
  }

  @Get('/:id')
  getOne(@Param() params: LogisticsIdDto): Promise<Logistics | null> {
    return this.logisticsService.findOne(params.id);
  }

  @Get('/list')
  getList(@Query() queryLogisticsDto: QueryLogisticsDto): Promise<PaginationResult<Logistics>> {
    const { page = 1, pageSize = 10, keyword, name, senderNo, receiverNo, orderNo, currentStatus, receive_time } = queryLogisticsDto;
    return this.logisticsService.findAllPaged(page, pageSize, keyword || name, senderNo, receiverNo, orderNo, currentStatus, receive_time);
  }
}
