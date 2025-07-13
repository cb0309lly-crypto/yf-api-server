import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Base {
  @PrimaryColumn('uuid')
  no: string;

  @Column()
  name: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
