import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { Product } from './product';

export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
}

@Entity('yf_db_inventory')
export class Inventory extends Base {
  @Column({ name: 'product_no' })
  productNo: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'int', default: 0 })
  availableQuantity: number;

  @Column({ type: 'int', default: 10 })
  minStockLevel: number;

  @Column({ type: 'int', default: 100 })
  maxStockLevel: number;

  @Column({
    type: 'enum',
    enum: InventoryStatus,
    default: InventoryStatus.IN_STOCK,
  })
  status: InventoryStatus;

  @Column({ name: 'warehouse_location', nullable: true })
  warehouseLocation: string;

  @Column({ name: 'last_restock_date', nullable: true })
  lastRestockDate: Date;

  @Column({ name: 'next_restock_date', nullable: true })
  nextRestockDate: Date;

  @ManyToOne(() => Product, (product) => product.inventories)
  @JoinColumn({ name: 'product_no' })
  product: Product;
}
