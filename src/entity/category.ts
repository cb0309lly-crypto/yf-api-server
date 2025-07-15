import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './base';
import { Product } from './product';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Entity('yf_db_category')
export class Category extends Base {
  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'enum', enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  status: CategoryStatus;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ name: 'category_level', type: 'int', default: 1 })
  categoryLevel: number;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
} 