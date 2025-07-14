import { Entity, Column } from 'typeorm';
import { Base } from './base';

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
  @Column({ nullable: true })
  specs: string;
  @Column({ nullable: true })
  unit: string;
  @Column({ nullable: true })
  tag: string;
  @Column({ name: 'company_no', nullable: true })
  companyNo: string;
  @Column({ nullable: true, name: 'order_no' })
  orderNo: string;
}
