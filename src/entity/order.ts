import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Base } from './base';
import { User } from './user';
import { OrderItem } from './order-item';
import { Payment } from './payment';
import { Review } from './review';

export enum OrderStatus {
  'ORDERED' = '已下单',
  'UNPAY' = '未付款',
  'PAIED' = '已付款',
  'CANCELED' = '已取消',
  'DELIVERY' = '已配送',
  'UNKNOW' = '异常单',
}

@Entity('yf_db_order')
export class Order extends Base {
  @Column({ name: 'user_no' })
  userNo: string;

  @Column({ name: 'ship_address', nullable: true })
  shipAddress: string;

  @Column({ name: 'order_total', nullable: true })
  orderTotal: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ORDERED,
    name: 'order_status',
    nullable: true,
  })
  orderStatus: OrderStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ name: 'operator_no', nullable: true })
  operatorNo: string;

  @Column({ name: 'customer_no', nullable: true })
  customerNo: string;

  @Column({ name: 'product_no', nullable: true })
  productNo: string;

  @Column({ name: 'material_no', nullable: true })
  materialNo: string;

  @Column({ name: 'logistics_no', nullable: true })
  logisticsNo: string;

  // 关系映射
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_no' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => Review, (review) => review.order)
  reviews: Review[];
}
