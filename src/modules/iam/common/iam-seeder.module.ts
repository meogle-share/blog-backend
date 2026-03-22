import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { IamSeeder } from '@modules/iam/common/iam.seeder';
import { PASSWORD_HASHER } from '@modules/iam/auth/auth.tokens';
import { PasswordHasherArgon2 } from '@modules/iam/auth/infrastructure/password-hasher.argon2';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordCredentialModel, UserModel])],
  providers: [IamSeeder, { provide: PASSWORD_HASHER, useClass: PasswordHasherArgon2 }],
})
export class IamSeederModule {}
