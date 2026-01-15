import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommonResponseInterceptor } from './common/interceptors/common-response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  
  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('YF API Server')
    .setDescription('YF 商城系统 API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalInterceptors(new CommonResponseInterceptor());
  
  // 启动HTTP服务器
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`HTTP服务器运行在端口: ${process.env.PORT ?? 3000}`);
  console.log(`Swagger文档地址: http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
