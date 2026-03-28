import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { v7 as uuidv7 } from 'uuid';

export class PasswordCredentialModelFactory {
  private static sequence = 0;
  private static readonly BASE_DATE = new Date('2000-01-01T00:00:00Z');

  static create(
    count: number,
    override?: Partial<PasswordCredentialModel>,
  ): PasswordCredentialModel[] {
    return Array.from({ length: count }, () => this.createOne(override));
  }

  static reset(): void {
    this.sequence = 0;
  }

  private static createOne(override?: Partial<PasswordCredentialModel>): PasswordCredentialModel {
    this.sequence++;
    const model = new PasswordCredentialModel();
    Object.assign(model, {
      id: uuidv7(),
      accountId: uuidv7(),
      email: `testuser${this.sequence}@example.com`,
      hashedPassword: 'hashed_password_123',
      createdAt: this.BASE_DATE,
      updatedAt: this.BASE_DATE,
      ...override,
    });
    return model;
  }
}
