# 환경변수 & 진입점

## 로딩 구조

환경변수는 `src/configs/env.ts`에서 로딩·검증·export된다. 별도의 초기화 파일 없이, 각 진입점이 `appEnv`를 import하면 자동으로 초기화가 수행된다.

```
진입점 (main.ts, cli.ts, ...)
  → import { appEnv } from '@configs/env'
    → import 'reflect-metadata'
    → dotenv.config()로 .env.{NODE_ENV} 파일 로드
    → validate(process.env)로 검증 + 타입 변환
    → appEnv 싱글턴 export
```

NestJS 런타임에서는 `ConfigModule.forRoot()`이 추가로 `ConfigService`를 DI 컨테이너에 등록한다.

## 환경변수 접근 기준

| 상황 | 사용 | 예시 |
|------|------|------|
| DI 컨테이너 **밖** (부트스트랩, 마이그레이션, CLI, 테스트 셋업) | `appEnv` | `appEnv.DB_HOST` |
| DI 컨테이너 **안** (모듈, 서비스, 컨트롤러) | `ConfigService` 주입 | `configService.get('DB_HOST')` |
| 직접 사용 금지 | `process.env` | `env.ts` 초기화 코드 외에는 사용하지 않는다 |

## 새 환경변수 추가 시

1. `src/configs/env.validator.ts`의 `EnvironmentVariables` 클래스에 프로퍼티 + 검증 데코레이터 추가
2. 모든 `.env.*` 파일(`.env`, `.env.dev`, `.env.test`, `.env.test.load`, `.env.migration`)에 값 추가

## 진입점

### 현재 진입점

| 진입점 | 런타임 | 용도 |
|--------|--------|------|
| `src/main.ts` | `nest start` | NestJS HTTP 서버 |
| `src/cli.ts` | `ts-node` | CLI 커맨드 (nest-commander) |
| `src/common/database/migration.main.ts` | `typeorm-ts-node-commonjs` | TypeORM 마이그레이션 |
| `test/test.main.ts` | Jest | 테스트 셋업 |

### 생성 기준

- **프로세스 실행 주체(런타임)가 다를 때**만 새 진입점을 만든다
- 같은 런타임 내 기능 분기는 모듈로 해결한다 (예: CLI 커맨드 추가 → `CommandsModule`에 provider 추가)

### 진입점 필수 패턴

```typescript
import { appEnv } from '@configs/env';    // 1. 환경변수 로딩

console.debug(`[ENV] Starting XXX in "${appEnv.NODE_ENV}" mode`);  // 2. 환경 로깅

async function bootstrap() { ... }       // 3. 해당 런타임 고유의 부트스트랩
```