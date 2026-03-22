import { User as DomainUser } from '@modules/iam/user/domain/models/user.aggregate';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends DomainUser {}
  }
}

export {};
