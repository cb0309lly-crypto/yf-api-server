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
      // synchronize: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
