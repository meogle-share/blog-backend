import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasher } from '../domain/ports/password-hasher.port';

@Injectable()
export class PasswordHasherArgon2 implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain);
  }
}
