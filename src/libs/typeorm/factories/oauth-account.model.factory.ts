import { OAuthAccountModel } from '@modules/iam/auth/infrastructure/oauth-account.model';
import { v7 as uuidv7 } from 'uuid';

export class OAuthAccountModelFactory {
  private static sequence = 0;
  private static readonly BASE_DATE = new Date('2000-01-01T00:00:00Z');

  static create(count: number, override?: Partial<OAuthAccountModel>): OAuthAccountModel[] {
    return Array.from({ length: count }, () => this.createOne(override));
  }

  static reset(): void {
    this.sequence = 0;
  }

  private static createOne(override?: Partial<OAuthAccountModel>): OAuthAccountModel {
    this.sequence++;
    const model = new OAuthAccountModel();
    Object.assign(model, {
      id: uuidv7(),
      userId: uuidv7(),
      provider: 'github',
      providerAccountId: `github-id-${this.sequence}`,
      providerLogin: `githubuser${this.sequence}`,
      createdAt: this.BASE_DATE,
      updatedAt: this.BASE_DATE,
      ...override,
    });
    return model;
  }
}
