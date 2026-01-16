import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { Refund, Order } from '../entity';

@Module({
  imports: [TypeOrmModule.forFeature([Refund, Order])],
  controllers: [RefundController],
  providers: [RefundService],
})
export class RefundModule {}
