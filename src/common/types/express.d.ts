import { UserAccount } from '@modules/iam/auth/domain/models/user-account.aggregate';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserAccount {}
  }
}

export {};
