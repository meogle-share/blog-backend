import { Module } from '@nestjs/common';
import { UserModule } from '@modules/iam/user/user.module';
import { AuthModule } from '@modules/iam/auth/auth.module';
import { IamSeederModule } from '@modules/iam/common/iam-seeder.module';

@Module({
  imports: [UserModule, AuthModule, IamSeederModule],
})
export class IamModule {}
