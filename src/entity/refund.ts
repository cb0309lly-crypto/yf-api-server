import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Order } from './order';
import { User } from './user';

export enum RefundStatus {
  PENDING = 'pending',       // 待审核
  APPROVED = 'approved',     // 已同意
  REJECTED = 'rejected',     // 已拒绝
  COMPLETED = 'completed',   // 已完成 (打款成功)
  FAILED = 'failed',         // 退款失败
}

export enum RefundType {
  MONEY_ONLY = 'money_only',       // 仅退款
  RETURN_GOODS = 'return_goods',   // 退货退款
}

@Entity('yf_db_refund')
export class Refund extends Base {
  @Column({ name: 'refund_no', unique: true })
  refundNo: string;

  @Column({ name: 'order_no' })
  orderNo: string;

  @Column({ name: 'user_no' })
  userNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: RefundType, default: RefundType.MONEY_ONLY })
  type: RefundType;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @Column({ name: 'admin_remark', nullable: true })
  adminRemark: string;

  @Column({ name: 'audit_time', nullable: true })
  auditTime: Date;

  @Column({ name: 'completed_time', nullable: true })
  completedTime: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_no' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_no' })
  user: User;
}
