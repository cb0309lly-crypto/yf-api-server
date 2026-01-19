import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../entity/user';
import { Order } from '../entity/order';
import { Product } from '../entity/product';
import { Payment } from '../entity/payment';
import { Category } from '../entity/category';
import { Promotion } from '../entity/promotion';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Product, Payment, Category, Promotion]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
