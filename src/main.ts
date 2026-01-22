import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommonResponseInterceptor } from './common/interceptors/common-response.interceptor';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  // 创建HTTP应用
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 获取配置服务
  const configService = app.get(ConfigService);

  // 启用CORS - 使用环境变量配置
  const allowedOrigins = configService.get<string[]>('cors.origins') || [];
  app.enableCors({
    origin: allowedOrigins,
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

  // 全局验证管道配置
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动删除非白名单属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 禁止非白名单属性
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
      disableErrorMessages: false, // 启用错误消息
      validationError: {
        target: false, // 不返回目标对象
        value: false, // 不返回值
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new ValidationExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new CommonResponseInterceptor());

  // 启动HTTP服务器 - 使用配置的端口
  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  logger.log(`HTTP服务器运行在端口: ${port}`);
  logger.log(`Swagger文档地址: http://localhost:${port}/api-docs`);
  logger.log(`允许的CORS域名: ${allowedOrigins.join(', ')}`);
  logger.log(`全局验证管道已启用`);
}
bootstrap();
