import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { BaseModel } from '@libs/typeorm';
import { AccountModel } from './account.model';

@Entity('password_credentials')
export class PasswordCredentialModel extends BaseModel {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  accountId!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  hashedPassword!: string;

  @ManyToOne(() => AccountModel, (account) => account.passwordCredentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account?: Relation<AccountModel>;
}
