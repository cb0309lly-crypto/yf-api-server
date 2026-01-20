import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Category } from './category';
import { Inventory } from './inventory';
import { Cart } from './cart';
import { OrderItem } from './order-item';
import { Review } from './review';
import { Wishlist } from './wishlist';

export enum ProductStatus {
  ACTIVE = '已上架',
  INACTIVE = '已下架',
  OUT_OF_STOCK = '缺货',
  IN_STOCK = '有货',
  SALED = '售罄',
}

@Entity('yf_db_product')
export class Product extends Base {
  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0.0,
    name: 'market_price',
  })
  marketPrice: number;

  @Column({ nullable: true, name: 'image_url' })
  imgUrl: string;

  @Column({ type: 'json', nullable: true, name: 'swiper_images' })
  swiperImages: string[];

  @Column({ type: 'json', nullable: true, name: 'detail_images' })
  detailImages: string[];

  @Column({
    nullable: true,
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ nullable: true })
  specs: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ name: 'company_no', nullable: true })
  companyNo: string;

  @Column({ name: 'category_no', nullable: true })
  categoryNo: string;

  @Column({ name: 'order_no', nullable: true })
  orderNo: string;

  @Column({ name: 'min_buy_quantity', type: 'int', default: 1 })
  minBuyQuantity: number;

  @Column({ name: 'sale_unit_quantity', type: 'int', default: 1 })
  saleUnitQuantity: number;

  @Column({ name: 'is_delete', default: false })
  isDelete: boolean;

  // 关系映射
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_no' })
  category: Category;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[];

  @OneToMany(() => Cart, (cart) => cart.product)
  cartItems: Cart[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlistItems: Wishlist[];
}
