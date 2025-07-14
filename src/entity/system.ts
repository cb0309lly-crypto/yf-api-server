import { Entity, Column } from 'typeorm';
import { Base } from './base';

@Entity('yf_db_system')
export class System extends Base {
  @Column()
  version: string;
  @Column({ nullable: true })
  materialNo: string;
  @Column({ nullable: true })
  device: string;
  @Column({ nullable: true })
  operatorNo: string;
  @Column({ nullable: true })
  status: string;
}