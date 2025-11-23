/**
 * TypeORM Migration 진입점
 */
import '../init';
import { appEnv } from '@configs/env';
export { dataSource } from '../configs/database.config';

console.debug(`[ENV] Starting Test in "${appEnv.NODE_ENV}" mode`);
