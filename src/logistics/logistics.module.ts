import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { Logistics } from '../entity/logistics';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Logistics])],
  controllers: [LogisticsController],
  providers: [LogisticsService],
})
export class LogisticsModule {}
