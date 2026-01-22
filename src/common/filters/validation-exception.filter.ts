import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // 格式化验证错误消息
    let message = '参数验证失败';
    let errors: any = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      if (Array.isArray(exceptionResponse.message)) {
        // class-validator 返回的错误数组
        errors = exceptionResponse.message;
        message = `参数验证失败: ${errors.join('; ')}`;
      } else {
        message = exceptionResponse.message;
      }
    }

    // 记录验证错误日志
    this.logger.warn(
      `验证失败 [${request.method}] ${request.url} - ${message}`,
    );

    // 返回统一格式的错误响应
    response.status(status).json({
      code: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
