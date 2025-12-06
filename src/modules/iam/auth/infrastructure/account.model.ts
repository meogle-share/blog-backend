import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseModel } from '@libs/typeorm';

@Entity('accounts')
export class AccountModel extends BaseModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
