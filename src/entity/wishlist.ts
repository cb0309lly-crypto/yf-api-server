import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { User } from './user';
import { Product } from './product';

@Entity('yf_db_wishlist')
export class Wishlist extends Base {
  @Column({ name: 'user_no' })
  userNo: string;

  @Column({ name: 'product_no' })
  productNo: string;

  @Column({ name: 'added_at' })
  addedAt: Date;

  @Column({ name: 'is_notified', type: 'boolean', default: false })
  isNotified: boolean;

  @Column({
    name: 'price_when_added',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceWhenAdded: number;

  @ManyToOne(() => User, (user) => user.wishlistItems)
  @JoinColumn({ name: 'user_no' })
  user: User;

  @ManyToOne(() => Product, (product) => product.wishlistItems)
  @JoinColumn({ name: 'product_no' })
  product: Product;
}
