import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommonResponseInterceptor } from './common/interceptors/common-response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 创建HTTP应用
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new CommonResponseInterceptor());
  
  // 启动HTTP服务器
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`HTTP服务器运行在端口: ${process.env.PORT ?? 3000}`);
}
bootstrap();
