import { Entity, Column } from 'typeorm';
import { Base } from './base';

@Entity('yf_db_menu')
export class Menu extends Base {
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  component: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: '1' })
  status: string; // 1: enable, 0: disable

  @Column({ nullable: true })
  i18nKey: string;

  @Column({ type: 'text', nullable: true })
  buttons: string; // JSON 字符串，存储按钮权限 [{ code: string, desc: string }]

  @Column({ type: 'simple-array', nullable: true })
  roles: string[]; // For simple check if needed, but mainly use relation in Role
}
