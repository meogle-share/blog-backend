import { Module } from '@nestjs/common';
import { UserModule } from '@modules/iam/user/user.module';

@Module({
  imports: [UserModule],
})
export class IamModule {}
