import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { isDev } from './env.helper';
import * as path from 'node:path';

/**
 * TypeORM DataSource 기본 옵션 생성
 */
export const createDataSourceOptions = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [path.resolve(__dirname, '../modules/**/*.model.{ts,js}')],
    migrations: [path.resolve(__dirname, '../database/migrations/**/*.{ts,js}')],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    logging: false,
  };
};

/**
 * NestJS TypeOrmModule용 설정
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    synchronize: isDev(),
    logging: false,
    autoLoadEntities: true,
    migrations: ['dist/migrations/*.js'],
  };
};

/**
 * 마이그레이션용 DataSource
 * CLI 명령어에서 사용됨 (npm run migration:generate, migration:run 등)
 */
export const dataSourceForMigration = new DataSource(createDataSourceOptions());
