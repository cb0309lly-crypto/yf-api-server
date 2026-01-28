import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 库存不足异常
 */
export class InsufficientStockException extends HttpException {
  constructor(
    productNo: string,
    required: number,
    available: number,
    message?: string,
  ) {
    const defaultMessage =
      message ||
      `商品 ${productNo} 库存不足，需要 ${required}，可用 ${available}`;

    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: defaultMessage,
        error: 'InsufficientStock',
        details: {
          productNo,
          required,
          available,
          shortage: required - available,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
