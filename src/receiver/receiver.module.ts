import { Module } from '@nestjs/common';
import { ReceiverController } from './receiver.controller';
import { ReceiverService } from './receiver.service';
import { Receiver } from '../entity/receiver';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Receiver])],
  controllers: [ReceiverController],
  providers: [ReceiverService],
})
export class ReceiverModule {}
