import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../entity/product';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    RedisModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
