import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { User } from './user';
import { Product } from './product';
import { Order } from './order';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden'
}

@Entity('yf_db_review')
export class Review extends Base {
  @Column({ name: 'user_no' })
  userNo: string;

  @Column({ name: 'product_no' })
  productNo: string;

  @Column({ name: 'order_no', nullable: true })
  orderNo: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ name: 'review_time' })
  reviewTime: Date;

  @Column({ name: 'is_verified_purchase', type: 'boolean', default: false })
  isVerifiedPurchase: boolean;

  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: string[];

  @Column({ name: 'admin_reply', nullable: true, type: 'text' })
  adminReply: string;

  @Column({ name: 'reply_time', nullable: true })
  replyTime: Date;

  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'user_no' })
  user: User;

  @ManyToOne(() => Product, product => product.reviews)
  @JoinColumn({ name: 'product_no' })
  product: Product;

  @ManyToOne(() => Order, order => order.reviews)
  @JoinColumn({ name: 'order_no' })
  order: Order;
} 