import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { v7 as uuidv7 } from 'uuid';

export class AccountModelFactory {
  private static sequence = 0;
  private static readonly BASE_DATE = new Date('2000-01-01T00:00:00Z');

  static create(count: number, override?: Partial<AccountModel>): AccountModel[] {
    return Array.from({ length: count }, () => this.createOne(override));
  }

  static reset(): void {
    this.sequence = 0;
  }

  private static createOne(override?: Partial<AccountModel>): AccountModel {
    this.sequence++;
    const account = new AccountModel();
    Object.assign(account, {
      id: uuidv7(),
      username: `testuser${this.sequence}`,
      password: 'hashed_password_123',
      createdAt: this.BASE_DATE,
      updatedAt: this.BASE_DATE,
      ...override,
    });
    return account;
  }
}
