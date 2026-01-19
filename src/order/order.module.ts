import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../entity/order';
import { OrderItem } from '../entity/order-item';
import { Product } from '../entity/product';
import { Payment } from '../entity/payment';
import { Logistics } from '../entity/logistics';
import { Receiver } from '../entity/receiver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryModule } from '../inventory/inventory.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Payment,
      Logistics,
      Receiver,
    ]),
    InventoryModule,
    CouponModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
