/**
 * 공통 초기화 파일
 *
 * 이 파일을 import하는 진입점들
 * - src/main.ts                (NestJS 애플리케이션)
 * - src/database/migration.main.ts    (TypeORM 마이그레이션)
 * - test/test.main.ts              (Jest 테스트)
 *
 * 새로운 진입점 추가 시 여기에 기록할 것
 */

import 'reflect-metadata';
import './configs/env';
