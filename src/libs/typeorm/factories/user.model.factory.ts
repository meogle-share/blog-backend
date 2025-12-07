import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { v7 as uuidv7 } from 'uuid';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AccountModelFactory } from '@libs/typeorm/factories/account.model.factory';

export class UserModelFactory {
  private static sequence = 0;
  private static readonly BASE_DATE = new Date('2000-01-01T00:00:00Z');

  static create(count: number, override?: Partial<UserModel>): UserModel[] {
    return Array.from({ length: count }, () => this.createOne(override));
  }

  static createWithAccount(
    count: number,
    override?: {
      account?: Partial<AccountModel>;
      user?: Partial<UserModel>;
    },
  ): { accounts: AccountModel[]; users: UserModel[] } {
    const accounts: AccountModel[] = [];
    const users: UserModel[] = [];

    for (let i = 0; i < count; i++) {
      const account = AccountModelFactory.create(1, override?.account)[0];
      const user = this.createOne({
        accountId: account.id,
        ...override?.user,
      });
      accounts.push(account);
      users.push(user);
    }

    return { accounts, users };
  }

  static reset(): void {
    this.sequence = 0;
  }

  private static createOne(override?: Partial<UserModel>): UserModel {
    this.sequence++;
    const user = new UserModel();
    Object.assign(user, {
      id: uuidv7(),
      accountId: uuidv7(),
      nickname: `테스트유저${this.sequence}`,
      createdAt: this.BASE_DATE,
      updatedAt: this.BASE_DATE,
      ...override,
    });
    return user;
  }
}
