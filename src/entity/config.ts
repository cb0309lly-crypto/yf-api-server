import { Entity, Column } from 'typeorm';
import { Base } from './base';

@Entity('yf_db_config')
export class Config extends Base {
  @Column({ unique: true })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ nullable: true })
  description: string;
}
