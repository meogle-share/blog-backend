import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { BaseModel } from '@libs/typeorm';
import { AccountModel } from './account.model';

@Entity('oauth_accounts')
@Unique('UQ_oauth_provider_account', ['provider', 'providerAccountId'])
export class OAuthAccountModel extends BaseModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  accountId!: string;

  @Column()
  provider!: string;

  @Column()
  providerAccountId!: string;

  @Column()
  providerLogin!: string;

  @ManyToOne(() => AccountModel, (account) => account.oauthAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account?: Relation<AccountModel>;
}
