import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { v7 as uuidv7 } from 'uuid';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { PasswordCredentialModelFactory } from '@libs/typeorm/factories/password-credential.model.factory';

export class UserModelFactory {
  private static sequence = 0;
  private static readonly BASE_DATE = new Date('2000-01-01T00:00:00Z');

  static create(count: number, override?: Partial<UserModel>): UserModel[] {
    return Array.from({ length: count }, () => this.createOne(override));
  }

  static createWithCredential(
    count: number,
    override?: {
      credential?: Partial<PasswordCredentialModel>;
      user?: Partial<UserModel>;
    },
  ): { credentials: PasswordCredentialModel[]; users: UserModel[] } {
    const credentials: PasswordCredentialModel[] = [];
    const users: UserModel[] = [];

    for (let i = 0; i < count; i++) {
      const user = this.createOne(override?.user);
      const credential = PasswordCredentialModelFactory.create(1, {
        userId: user.id,
        email: user.email ?? undefined,
        ...override?.credential,
      })[0];
      users.push(user);
      credentials.push(credential);
    }

    return { credentials, users };
  }

  static reset(): void {
    this.sequence = 0;
  }

  private static createOne(override?: Partial<UserModel>): UserModel {
    this.sequence++;
    const user = new UserModel();
    Object.assign(user, {
      id: uuidv7(),
      nickname: `테스트유저${this.sequence}`,
      email: `testuser${this.sequence}@example.com`,
      createdAt: this.BASE_DATE,
      updatedAt: this.BASE_DATE,
      ...override,
    });
    return user;
  }
}
