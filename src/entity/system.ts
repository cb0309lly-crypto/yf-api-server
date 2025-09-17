import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';

export enum SystemStatus {
  Init = 'init',
  Ready = 'ready',
  Active = 'active',
  Terminated = 'terminated',
  Error = 'error',
}

@Entity('yf_db_system')
export class System extends Base {
  @Column()
  version: string;

  @Column({ name: 'material', nullable: true })
  material: string;

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true, name: 'operator_no' })
  operatorNo: string;

  @Column({ type: 'enum', enum: SystemStatus, default: SystemStatus.Init })
  status: SystemStatus;
}