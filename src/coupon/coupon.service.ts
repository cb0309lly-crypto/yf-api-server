import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponStatus, CouponType } from '../entity/coupon';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  create(body) {
    const coupon = this.couponRepository.create(body);
    return this.couponRepository.save(coupon);
  }

  findAll(query) {
    const { page = 1, limit = 10, status, type, isGlobal } = query;
    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    if (status) {
      queryBuilder.andWhere('coupon.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('coupon.type = :type', { type });
    }

    if (isGlobal !== undefined) {
      queryBuilder.andWhere('coupon.isGlobal = :isGlobal', { isGlobal });
    }

    queryBuilder
      .leftJoinAndSelect('coupon.user', 'user')
      .orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.couponRepository.findOne({
      where: { no: id },
      relations: ['user'],
    });
  }

  update(id: string, body) {
    return this.couponRepository.update(id, body);
  }

  remove(id: string) {
    return this.couponRepository.delete(id);
  }

  getUserCoupons(userId: string, query) {
    const { page = 1, limit = 10, status } = query;
    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    queryBuilder.andWhere('coupon.userNo = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('coupon.status = :status', { status });
    }

    queryBuilder
      .orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  validateCoupon(body) {
    const { code, amount, productIds } = body;
    
    return this.couponRepository.findOne({
      where: { code, status: CouponStatus.ACTIVE },
    }).then(coupon => {
      if (!coupon) {
        return { valid: false, message: '优惠券不存在' };
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return { valid: false, message: '优惠券已过期或未生效' };
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: '优惠券使用次数已达上限' };
      }

      if (amount < coupon.minimumAmount) {
        return { valid: false, message: `订单金额不足，最低需要${coupon.minimumAmount}元` };
      }

      return { valid: true, coupon };
    });
  }

  useCoupon(body) {
    const { couponId, orderNo } = body;
    
    return this.couponRepository.findOne({ where: { no: couponId } }).then(coupon => {
      if (coupon && coupon.status === CouponStatus.ACTIVE) {
        return this.couponRepository.update(couponId, {
          usedCount: () => 'usedCount + 1',
          status: CouponStatus.USED,
        });
      }
    });
  }

  getAvailableCoupons(userId: string, query) {
    const { amount, productIds } = query;
    const now = new Date();
    
    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    queryBuilder.andWhere('coupon.status = :status', { status: CouponStatus.ACTIVE });
    queryBuilder.andWhere('coupon.validFrom <= :now', { now });
    queryBuilder.andWhere('coupon.validUntil >= :now', { now });
    queryBuilder.andWhere('(coupon.userNo = :userId OR coupon.isGlobal = true)', { userId });

    if (amount) {
      queryBuilder.andWhere('coupon.minimumAmount <= :amount', { amount });
    }

    return queryBuilder.getMany();
  }
} 