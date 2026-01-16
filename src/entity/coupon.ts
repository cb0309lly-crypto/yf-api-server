import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { User } from './user';

export enum CouponType {
  DISCOUNT = 'discount',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  PERCENTAGE = 'percentage',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  USED = 'used',
}

@Entity('yf_db_coupon')
export class Coupon extends Base {
  @Column({ name: 'user_no', nullable: true })
  userNo: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  value: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  minimumAmount: number;

  @Column({ type: 'enum', enum: CouponStatus, default: CouponStatus.ACTIVE })
  status: CouponStatus;

  @Column({ name: 'valid_from' })
  validFrom: Date;

  @Column({ name: 'valid_until' })
  validUntil: Date;

  @Column({ name: 'usage_limit', type: 'int', default: 1 })
  usageLimit: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'code', unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'applicable_products', type: 'json', nullable: true })
  applicableProducts: string[];

  @Column({ name: 'applicable_categories', type: 'json', nullable: true })
  applicableCategories: string[];

  @Column({ name: 'is_global', type: 'boolean', default: false })
  isGlobal: boolean;

  @ManyToOne(() => User, (user) => user.coupons)
  @JoinColumn({ name: 'user_no' })
  user: User;
}
