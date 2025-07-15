import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommonResponseInterceptor } from './common/interceptors/common-response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new CommonResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
