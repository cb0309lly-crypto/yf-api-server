import { Entity, Column } from 'typeorm';
import { Base } from './base';

export enum PromotionType {
  DISCOUNT = 'discount',
  BUY_ONE_GET_ONE = 'buy_one_get_one',
  FLASH_SALE = 'flash_sale',
  BUNDLE = 'bundle',
  FREE_SHIPPING = 'free_shipping',
}

export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Entity('yf_db_promotion')
export class Promotion extends Base {
  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  discountValue: number;

  @Column({
    type: 'enum',
    enum: PromotionStatus,
    default: PromotionStatus.DRAFT,
  })
  status: PromotionStatus;

  @Column({ name: 'start_date' })
  startDate: Date;

  @Column({ name: 'end_date' })
  endDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'banner_image', nullable: true })
  bannerImage: string;

  @Column({ name: 'applicable_products', type: 'json', nullable: true })
  applicableProducts: string[];

  @Column({ name: 'applicable_categories', type: 'json', nullable: true })
  applicableCategories: string[];

  @Column({
    name: 'minimum_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  minimumAmount: number;

  @Column({
    name: 'maximum_discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maximumDiscount: number;

  @Column({ name: 'usage_limit_per_user', type: 'int', default: 1 })
  usageLimitPerUser: number;

  @Column({ name: 'total_usage_limit', type: 'int', nullable: true })
  totalUsageLimit: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;
}
