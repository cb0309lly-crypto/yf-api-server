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
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './user/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'rm-bp11a37ok3eh0c9jjbo.mysql.rds.aliyuncs.com',
      // host: 'localhost',
      port: 3306,
      username: 'yf_root',
      password: 'Yf@123456',
      database: 'yf-db',
      synchronize: true,
      // logging: true,
      entities: [__dirname + '/entity/*{.ts,.js}'],
    }),
    UserModule,
    OrderModule,
    LogisticsModule,
    ProductModule,
    SystemModule,
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
