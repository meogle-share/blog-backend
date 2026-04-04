import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'node:path';
import { appEnv } from '@configs/env';
import { NodeEnvironment } from '@configs/env.validator';

/**
 * NestJS TypeOrmModule용 설정
 */
export const getDataSourceOptionsForNest = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST') || appEnv.DB_HOST,
    port: configService.get<number>('DB_PORT') || appEnv.DB_PORT,
    username: configService.get<string>('DB_USERNAME') || appEnv.DB_USERNAME,
    password: configService.get<string>('DB_PASSWORD') || appEnv.DB_PASSWORD,
    database: configService.get<string>('DB_DATABASE') || appEnv.DB_DATABASE,
    synchronize: appEnv.NODE_ENV === NodeEnvironment.LOCAL,
    logging: false,
    autoLoadEntities: true,
    migrations: [path.resolve(__dirname, '../common/database/migrations/**/*.{ts,js}')],
  };
};

/**
 * 범용 TypeOrm DataSource 설정
 */
export const getDataSourceOptions = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: appEnv.DB_HOST,
    port: appEnv.DB_PORT,
    username: appEnv.DB_USERNAME,
    password: appEnv.DB_PASSWORD,
    database: appEnv.DB_DATABASE,
    entities: [path.resolve(__dirname, '../modules/**/*.model.{ts,js}')],
    migrations: [path.resolve(__dirname, '../common/database/migrations/**/*.{ts,js}')],
    synchronize: appEnv.NODE_ENV === NodeEnvironment.LOCAL,
    logging: false,
  };
};

export const dataSource: DataSource = new DataSource(getDataSourceOptions());
