import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 优惠券无效异常
 */
export class CouponInvalidException extends HttpException {
  constructor(couponId: string, reason: string, message?: string) {
    const defaultMessage =
      message || `优惠券 ${couponId} 不可用：${reason}`;

    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: defaultMessage,
        error: 'InvalidCoupon',
        details: {
          couponId,
          reason,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * 优惠券已使用异常
 */
export class CouponAlreadyUsedException extends CouponInvalidException {
  constructor(couponId: string) {
    super(couponId, '优惠券已使用', `优惠券 ${couponId} 已使用`);
  }
}

/**
 * 优惠券已过期异常
 */
export class CouponExpiredException extends CouponInvalidException {
  constructor(couponId: string) {
    super(couponId, '优惠券已过期', `优惠券 ${couponId} 已过期`);
  }
}

/**
 * 优惠券不满足使用条件异常
 */
export class CouponConditionNotMetException extends CouponInvalidException {
  constructor(couponId: string, minAmount: number, currentAmount: number) {
    super(
      couponId,
      `订单金额需满 ${minAmount} 元，当前 ${currentAmount} 元`,
      `优惠券 ${couponId} 不满足使用条件`,
    );
  }
}
