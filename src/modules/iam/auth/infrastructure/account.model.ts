import { Entity, OneToMany, PrimaryColumn, type Relation } from 'typeorm';
import { BaseModel } from '@libs/typeorm';
import { OAuthAccountModel } from './oauth-account.model';
import { PasswordCredentialModel } from './password-credential.model';

@Entity('accounts')
export class AccountModel extends BaseModel {
  @PrimaryColumn('uuid')
  id!: string;

  @OneToMany(() => OAuthAccountModel, (oa) => oa.account, { cascade: true, eager: true })
  oauthAccounts!: Relation<OAuthAccountModel[]>;

  @OneToMany(() => PasswordCredentialModel, (pc) => pc.account, { cascade: true, eager: true })
  passwordCredentials!: Relation<PasswordCredentialModel[]>;
}
