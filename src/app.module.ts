import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { LogisticsModule } from './logistics/logistics.module';
import { ProductModule } from './product/product.module';
import { SystemModule } from './system/system.module';
import { ReceiverModule } from './receiver/receiver.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from './company/company.module';

// 新增模块
import { CategoryModule } from './category/category.module';
import { InventoryModule } from './inventory/inventory.module';
import { CartModule } from './cart/cart.module';
import { OrderItemModule } from './order-item/order-item.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { CouponModule } from './coupon/coupon.module';
import { PromotionModule } from './promotion/promotion.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { NotificationModule } from './notification/notification.module';
import { RedisModule } from './redis/redis.module';
import { StatsModule } from './stats/stats.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './user/jwt-auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './upload/upload.module';
import { join } from 'path';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'pgm-bp102n397uomya2gko.pg.rds.aliyuncs.com',
      // host: 'localhost',
      port: 5432,
      username: 'yf_pg',
      password: 'Cb@920309',
      database: 'yf',
      synchronize: true,
      // logging: true,
      entities: [__dirname + '/entity/*{.ts,.js}'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    UploadModule,
    UserModule,
    OrderModule,
    LogisticsModule,
    ProductModule,
    SystemModule,
    SystemManageModule,
    ReceiverModule,
    CompanyModule,
    // 新增模块
    CategoryModule,
    InventoryModule,
    CartModule,
    OrderItemModule,
    PaymentModule,
    ReviewModule,
    CouponModule,
    PromotionModule,
    WishlistModule,
    NotificationModule,
    RedisModule,
    StatsModule,
    RefundModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
