import { Entity, Column } from 'typeorm';
import { Base } from './base';

@Entity('yf_db_company')
export class Company extends Base {
  @Column({ nullable: true })
  description: string;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true, name: 'tax_id' })
  taxId: string;
  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  creator: string;
}
