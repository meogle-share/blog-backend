import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { v7 as uuidv7 } from 'uuid';

export class UserModelFactory {
  private static sequence = 0;
  private static readonly BASE_DATE = new Date('2000-01-01T00:00:00Z');

  static create(override?: Partial<UserModel>): UserModel {
    this.sequence++;

    const accountId = uuidv7();
    const user = new UserModel();
    Object.assign(user, {
      id: uuidv7(),
      accountId: accountId,
      nickname: `테스트유저${this.sequence}`,
      createdAt: this.BASE_DATE,
      updatedAt: this.BASE_DATE,
      ...override,
    });

    return user;
  }

  static reset(): void {
    this.sequence = 0;
  }
}
