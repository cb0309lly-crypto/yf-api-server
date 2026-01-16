import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Base } from './base';
import { Menu } from './menu';

@Entity('yf_db_role')
export class Role extends Base {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '1' })
  status: string; // 1: enable, 0: disable

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'yf_db_role_menu',
    joinColumn: { name: 'role_no', referencedColumnName: 'no' },
    inverseJoinColumn: { name: 'menu_no', referencedColumnName: 'no' },
  })
  menus: Menu[];
}
