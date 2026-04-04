import { ConfigService } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  issuer: string;
  expiresIn: number;
}

export function createJwtConfig(config: ConfigService): JwtConfig {
  return {
    secret: config.getOrThrow<string>('JWT_SECRET'),
    issuer: `meogle-${config.getOrThrow<string>('NODE_ENV')}`,
    expiresIn: 300,
  };
}
