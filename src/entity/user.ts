import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './base';
import { Cart } from './cart';
import { Order } from './order';
import { Payment } from './payment';
import { Review } from './review';
import { Coupon } from './coupon';
import { Wishlist } from './wishlist';
import { Notification } from './notification';

export enum Gender {
  FEMALE,
  MALE,
  UNKNOWN,
}

export enum UserStatus {
  CREATED = 'created',
  ONLINE = 'online',
  OFFLINE = 'offline',
  ACITIVE = 'active',
  LOSED = 'losed'
}

@Entity('yf_db_user')
export class User extends Base {
  @Column()
  phone: string;
  
  @Column({ type: 'int', default: 0 })
  level: number;
  
  @Column({ type: 'enum', enum: Gender, default: Gender.UNKNOWN })
  gender: Gender;
  
  @Column({ name: 'id_card', nullable: true })
  idCrad: string;
  
  @Column({ nullable: true })
  avatar: string;
  
  @Column({ nullable: true })
  address: string;
  
  @Column({ nullable: true })
  description: string;
  
  @Column({ nullable: true })
  nickname: string;
  
  @Column({ name: 'auth_login', nullable: true })
  authLogin: string;
  
  @Column({ name: 'auth_password', nullable: true })
  authPassword: string;
  
  @Column({ name: 'open_id', nullable: true })
  openId: string;
  
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.CREATED })
  status: string;

  // 关系映射
  @OneToMany(() => Cart, cart => cart.user)
  cartItems: Cart[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Coupon, coupon => coupon.user)
  coupons: Coupon[];

  @OneToMany(() => Wishlist, wishlist => wishlist.user)
  wishlistItems: Wishlist[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
