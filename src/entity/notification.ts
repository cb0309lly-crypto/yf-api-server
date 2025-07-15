import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from './base';
import { User } from './user';

export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PAYMENT = 'payment',
  SHIPPING = 'shipping',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  SECURITY = 'security'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

@Entity('yf_db_notification')
export class Notification extends Base {
  @Column({ name: 'user_no' })
  userNo: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Column({ name: 'action_url', nullable: true })
  actionUrl: string;

  @Column({ name: 'related_id', nullable: true })
  relatedId: string;

  @Column({ name: 'related_type', nullable: true })
  relatedType: string;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'is_push_sent', type: 'boolean', default: false })
  isPushSent: boolean;

  @Column({ name: 'is_email_sent', type: 'boolean', default: false })
  isEmailSent: boolean;

  @Column({ name: 'is_sms_sent', type: 'boolean', default: false })
  isSmsSent: boolean;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_no' })
  user: User;
} 