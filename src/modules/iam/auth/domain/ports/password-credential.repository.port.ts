import { PasswordCredential } from '../models/password-credential.entity';

export interface PasswordCredentialRepositoryPort {
  findOneByEmail(email: string): Promise<PasswordCredential | null>;
  save(credential: PasswordCredential): Promise<PasswordCredential>;
}
