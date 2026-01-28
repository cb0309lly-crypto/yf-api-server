import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 支付失败异常
 */
export class PaymentFailedException extends HttpException {
  constructor(
    orderNo: string,
    reason: string,
    transactionId?: string,
    message?: string,
  ) {
    const defaultMessage =
      message || `订单 ${orderNo} 支付失败：${reason}`;

    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: defaultMessage,
        error: 'PaymentFailed',
        details: {
          orderNo,
          reason,
          transactionId,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * 支付金额不匹配异常
 */
export class PaymentAmountMismatchException extends PaymentFailedException {
  constructor(
    orderNo: string,
    expectedAmount: number,
    actualAmount: number,
  ) {
    super(
      orderNo,
      `支付金额不匹配，订单金额: ${expectedAmount}，支付金额: ${actualAmount}`,
      undefined,
      `订单 ${orderNo} 支付金额不匹配`,
    );
  }
}

/**
 * 重复支付异常
 */
export class DuplicatePaymentException extends PaymentFailedException {
  constructor(orderNo: string, existingTransactionId: string) {
    super(
      orderNo,
      '订单已支付',
      existingTransactionId,
      `订单 ${orderNo} 已支付，不能重复支付`,
    );
  }
}
