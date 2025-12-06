import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { BaseModel } from '@libs/typeorm';

@Entity('users')
export class UserModel extends BaseModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  nickname: string;

  @Column('uuid')
  accountId: string;

  @ManyToOne(() => AccountModel)
  @JoinColumn({ name: 'accountId' })
  account?: Relation<AccountModel>;
}
