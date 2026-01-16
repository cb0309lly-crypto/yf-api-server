import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Order } from './order';
import { Product } from './product';

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('yf_db_order_item')
export class OrderItem extends Base {
  @Column({ name: 'order_no' })
  orderNo: string;

  @Column({ name: 'product_no' })
  productNo: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  totalPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  finalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status: OrderItemStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'product_snapshot', type: 'json', nullable: true })
  productSnapshot: any;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_no' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_no' })
  product: Product;
}
