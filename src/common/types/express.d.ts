import { Account } from '@modules/iam/auth/domain/account.aggregate';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Account {}
  }
}

export {};
