import { Controller, Put, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { Receiver } from '../entity/receiver';
import { CreateReceiverDto, UpdateReceiverDto, QueryReceiverDto, ReceiverIdDto } from './dto';
import { PaginationResult } from '../common/utils/pagination.util';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('收货人管理')
@ApiBearerAuth()
@Controller('receiver')
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) {}

  @Post()
  @ApiOperation({ summary: '创建收货人' })
  async addReceiver(@Body() createReceiverDto: CreateReceiverDto): Promise<Receiver> {
    return this.receiverService.createReceiver(createReceiverDto);
  }

  @Put()
  @ApiOperation({ summary: '更新收货人' })
  async editReceiver(@Body() updateReceiverDto: UpdateReceiverDto): Promise<Receiver> {
    return this.receiverService.updateReceiver(updateReceiverDto);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取收货人列表' })
  async getReceiverList(@Query() queryReceiverDto: QueryReceiverDto): Promise<PaginationResult<Receiver>> {
    const { page = 1, pageSize = 10, keyword, name, address, phone, email, groupBy, description, userNo } = queryReceiverDto;
    return this.receiverService.findAllPaged(page, pageSize, keyword || name, address, phone, email, groupBy, description, userNo);
  }

  @Get('/:no')
  @ApiOperation({ summary: '获取收货人详情' })
  async getReceiver(@Param() params: ReceiverIdDto): Promise<Receiver | null> {
    return this.receiverService.findOne(params.no);
  }
}
