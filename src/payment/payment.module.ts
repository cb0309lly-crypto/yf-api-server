import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from '../entity/payment';
import { Order } from '../entity/order';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
