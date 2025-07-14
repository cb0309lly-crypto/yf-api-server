import { Controller, Put, Post, Get, Body, Param } from '@nestjs/common';
import { ReceiverService } from './receiver.service';
import { Receiver } from '../entity/receiver';

@Controller('receiver')
export class ReceiverController {
  constructor(private readonly receiverService: ReceiverService) {}

  @Post()
  async addReceiver(@Body() body: Partial<Receiver>): Promise<Receiver> {
    return this.receiverService.createReceiver(body);
  }

  @Put()
  async editReceiver(@Body() body: Partial<Receiver>): Promise<Receiver> {
    return this.receiverService.updateReceiver(body);
  }

  @Get('/:no')
  async getReceiver(@Param('no') no: string): Promise<Receiver | null> {
    return this.receiverService.findOne(no);
  }

  @Get('/list')
  async getReceiverList(): Promise<Receiver[]> {
    return this.receiverService.findAll();
  }
}
