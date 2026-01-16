import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { User } from './user';
import { Product } from './product';

export enum CartItemStatus {
  ACTIVE = 'active',
  REMOVED = 'removed',
  PURCHASED = 'purchased',
}

@Entity('yf_db_cart')
export class Cart extends Base {
  @Column({ name: 'user_no' })
  userNo: string;

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
    type: 'enum',
    enum: CartItemStatus,
    default: CartItemStatus.ACTIVE,
  })
  status: CartItemStatus;

  @Column({ name: 'selected', type: 'boolean', default: true })
  selected: boolean;

  @Column({ name: 'added_at' })
  addedAt: Date;

  @ManyToOne(() => User, (user) => user.cartItems)
  @JoinColumn({ name: 'user_no' })
  user: User;

  @ManyToOne(() => Product, (product) => product.cartItems)
  @JoinColumn({ name: 'product_no' })
  product: Product;
}
