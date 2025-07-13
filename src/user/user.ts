import { Entity, PrimaryColumn } from 'typeorm';
import { Base } from '../entity/base';

@Entity('yf_db_user')
export class User extends Base {}
