import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Order } from './order';
import { User } from './user';

export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  BANK_CARD = 'bank_card',
  CASH = 'cash',
  WALLET = 'wallet'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity('yf_db_payment')
export class Payment extends Base {
  @Column({ name: 'order_no' })
  orderNo: string;

  @Column({ name: 'user_no' })
  userNo: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'payment_time', nullable: true })
  paymentTime: Date;

  @Column({ name: 'refund_time', nullable: true })
  refundTime: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  refundAmount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'gateway_response', type: 'json', nullable: true })
  gatewayResponse: any;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'order_no' })
  order: Order;

  @ManyToOne(() => User, user => user.payments)
  @JoinColumn({ name: 'user_no' })
  user: User;
} 