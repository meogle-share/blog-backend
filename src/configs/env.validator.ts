import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';
export enum NodeEnvironment {
  PRODUCTION = 'prod',
  DEVELOPMENT = 'dev',
  TEST = 'test',
  LOAD_TEST = 'load-test',
  MIGRATION = 'migration',
}

const notMigration = (o: EnvironmentVariables) => o.NODE_ENV !== NodeEnvironment.MIGRATION;

export class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(NodeEnvironment)
  NODE_ENV!: NodeEnvironment;

  @IsNotEmpty()
  @IsString()
  DB_HOST!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT!: number;

  @IsNotEmpty()
  @IsString()
  DB_USERNAME!: string;

  @IsNotEmpty()
  @IsString()
  DB_PASSWORD!: string;

  @IsNotEmpty()
  @IsString()
  DB_DATABASE!: string;

  @ValidateIf(notMigration)
  @IsNotEmpty()
  @IsString()
  JWT_SECRET!: string;

  @ValidateIf(notMigration)
  @IsNotEmpty()
  @IsString()
  GITHUB_CLIENT_ID!: string;

  @ValidateIf(notMigration)
  @IsNotEmpty()
  @IsString()
  GITHUB_CLIENT_SECRET!: string;

  @ValidateIf(notMigration)
  @IsNotEmpty()
  @IsString()
  GITHUB_CALLBACK_URL!: string;

  @ValidateIf(notMigration)
  @IsNotEmpty()
  @IsString()
  GITHUB_FRONTEND_REDIRECT_URL!: string;
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(`Config validation error:\n${errorMessages}`);
  }

  return validatedConfig;
}
