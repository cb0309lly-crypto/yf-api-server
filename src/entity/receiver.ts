import { Entity, Column } from 'typeorm';
import { Base } from './base';

@Entity('yf_db_receiver')
export class Receiver extends Base {
  @Column()
  address: string;
  @Column()
  phone: string;
  @Column({ nullable: true })
  email: string;
  @Column({ name: 'group_by', type: 'int' })
  groupBy: number;
  @Column({ nullable: true })
  description: string;
  @Column({ name: 'user_no', nullable: true })
  userNo: string;
}
