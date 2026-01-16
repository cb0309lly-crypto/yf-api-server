import { Entity, Column } from 'typeorm';
import { Base } from './base';
export enum LogisticsCurrentStatus {
  'ORDERED' = '已下单',
  'SHIPPED' = '已发货',
  'DELIVERY' = '配送中',
  'SIGNED' = '已签收',
  'UNKNOW' = '问题单',
}

@Entity('yf_db_logistics')
export class Logistics extends Base {
  @Column({ name: 'sender_no', nullable: true })
  senderNo: string;
  @Column({ name: 'receiver_no', nullable: true })
  receiverNo: string;
  @Column({ name: 'order_no', nullable: true })
  orderNo: string;
  @Column({
    type: 'enum',
    enum: LogisticsCurrentStatus,
    default: LogisticsCurrentStatus.ORDERED,
    name: 'current_status',
  })
  currentStatus: LogisticsCurrentStatus;
  @Column({ type: 'timestamp', nullable: true })
  receive_time: Date;
}
