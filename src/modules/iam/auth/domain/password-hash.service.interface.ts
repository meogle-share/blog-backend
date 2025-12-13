export const PASSWORD_HASH_SERVICE = Symbol('PASSWORD_HASH_SERVICE');

export interface IPasswordHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
