import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseModel } from '@libs/typeorm';

@Entity('users')
export class UserModel extends BaseModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { unique: true })
  accountId!: string;

  @Column({ unique: true })
  nickname!: string;

  @Column({ type: 'varchar', nullable: true })
  email!: string | null;
}
