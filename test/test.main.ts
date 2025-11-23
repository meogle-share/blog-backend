/**
 * Jest Test 진입점
 */
import '../src/init';
import { appEnv } from '@configs/env';
export { dataSource } from '../src/configs/database.config';

console.debug(`[ENV] Starting Test in "${appEnv.NODE_ENV}" mode`);
