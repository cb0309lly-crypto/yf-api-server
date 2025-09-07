import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { CommonResponseInterceptor } from './common/interceptors/common-response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { microserviceConfig } from './config/redis.config';

async function bootstrap() {
  // 创建HTTP应用
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new CommonResponseInterceptor());
  
  // 创建Redis微服务
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: microserviceConfig.options,
  });

  // 启动微服务
  await app.startAllMicroservices();
  
  // 启动HTTP服务器
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`HTTP服务器运行在端口: ${process.env.PORT ?? 3000}`);
  console.log(`Redis微服务已启动，配置:`, microserviceConfig.options);
}
bootstrap();
