/**
 * TypeORM Migration 진입점
 */
import { appEnv } from '@configs/env';
export { dataSource } from '@configs/database.config';

console.debug(`[ENV] Starting Migration in "${appEnv.NODE_ENV}" mode`);
