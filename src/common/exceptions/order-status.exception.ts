import { HttpException, HttpStatus } from '@nestjs/common';
import { OrderStatus } from '../../entity/order';

/**
 * 订单状态异常
 */
export class OrderStatusException extends HttpException {
  constructor(
    orderNo: string,
    currentStatus: OrderStatus,
    expectedStatus: OrderStatus | OrderStatus[],
    operation: string,
    message?: string,
  ) {
    const expectedStatusStr = Array.isArray(expectedStatus)
      ? expectedStatus.join(' 或 ')
      : expectedStatus;

    const defaultMessage =
      message ||
      `订单 ${orderNo} 状态为 ${currentStatus}，无法执行 ${operation} 操作，期望状态为 ${expectedStatusStr}`;

    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: defaultMessage,
        error: 'InvalidOrderStatus',
        details: {
          orderNo,
          currentStatus,
          expectedStatus,
          operation,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
