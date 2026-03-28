import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { OAuthAccountModel } from '@modules/iam/auth/infrastructure/oauth-account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { IamSeeder } from '@modules/iam/common/iam.seeder';
import { PASSWORD_HASHER } from '@modules/iam/auth/auth.tokens';
import { PasswordHasherArgon2 } from '@modules/iam/auth/infrastructure/password-hasher.argon2';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountModel, PasswordCredentialModel, OAuthAccountModel, UserModel]),
  ],
  providers: [IamSeeder, { provide: PASSWORD_HASHER, useClass: PasswordHasherArgon2 }],
})
export class IamSeederModule {}
