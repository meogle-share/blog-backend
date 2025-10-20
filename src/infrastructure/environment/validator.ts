import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

enum NodeEnvironment {
  PRODUCTION = 'prod',
  DEVELOPMENT = 'dev',
  TEST = 'test',
}

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsNotEmpty()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DB_DATABASE: string;
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
