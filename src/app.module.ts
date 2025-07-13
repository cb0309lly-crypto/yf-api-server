import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { LogisticsModule } from './logistics/logistics.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [UserModule, OrderModule, LogisticsModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
