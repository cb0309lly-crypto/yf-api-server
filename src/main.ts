import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommonResponseInterceptor } from './common/interceptors/common-response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 创建HTTP应用
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // 允许的前端域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new CommonResponseInterceptor());
  
  // 启动HTTP服务器
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`HTTP服务器运行在端口: ${process.env.PORT ?? 3000}`);
}
bootstrap();
