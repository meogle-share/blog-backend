import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';

@Entity('users')
export class UserModel {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  nickname: string;

  @Column('uuid')
  accountId: string;

  @ManyToOne(() => AccountModel)
  @JoinColumn({ name: 'accountId' })
  account?: Relation<AccountModel>;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  static from(data: { [K in keyof UserModel]: UserModel[K] }): UserModel {
    return Object.assign(new UserModel(), data);
  }
}
