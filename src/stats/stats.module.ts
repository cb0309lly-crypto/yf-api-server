import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../entity/user';
import { Order } from '../entity/order';
import { Product } from '../entity/product';
import { Payment } from '../entity/payment';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Product, Payment])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
