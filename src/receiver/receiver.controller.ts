import { Controller, Put, Post, Get, Body, Param, Query, UsePipes } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { Receiver } from '../entity/receiver';
import { CreateReceiverDto, UpdateReceiverDto, QueryReceiverDto, ReceiverIdDto } from './dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';

@Controller('receiver')
@UsePipes(new ValidationPipe())
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) {}

  @Post()
  async addReceiver(@Body() createReceiverDto: CreateReceiverDto): Promise<Receiver> {
    return this.receiverService.createReceiver(createReceiverDto);
  }

  @Put()
  async editReceiver(@Body() updateReceiverDto: UpdateReceiverDto): Promise<Receiver> {
    return this.receiverService.updateReceiver(updateReceiverDto);
  }

  @Get('/:no')
  async getReceiver(@Param() params: ReceiverIdDto): Promise<Receiver | null> {
    return this.receiverService.findOne(params.no);
  }

  @Get('/list')
  async getReceiverList(@Query() queryReceiverDto: QueryReceiverDto): Promise<Receiver[]> {
    const { page = 1, pageSize = 10, keyword, name, address, phone, email, groupBy, description, userNo } = queryReceiverDto;
    return this.receiverService.findAllPaged(page, pageSize, keyword || name, address, phone, email, groupBy, description, userNo);
  }
}
