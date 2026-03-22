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
import { UserModel } from '@modules/iam/user/infrastructure/user.model';

@Entity('oauth_accounts')
@Unique('UQ_oauth_provider_account', ['provider', 'providerAccountId'])
export class OAuthAccountModel extends BaseModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column()
  provider!: string;

  @Column()
  providerAccountId!: string;

  @Column()
  providerLogin!: string;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<UserModel>;
}
