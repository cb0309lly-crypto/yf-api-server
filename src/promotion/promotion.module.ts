import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { Promotion } from '../entity/promotion';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion])],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
