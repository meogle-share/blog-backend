import { Module } from '@nestjs/common';
import { UserModule } from '@modules/iam/user/user.module';
import { AuthModule } from '@modules/iam/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
})
export class IamModule {}
