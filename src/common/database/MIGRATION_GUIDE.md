# Database Migration Guide

TypeORM을 사용한 데이터베이스 마이그레이션 가이드입니다.

## 마이그레이션 파일 위치

```
src/common/database/migrations/
```

## 환경 설정

마이그레이션은 `NODE_ENV=migration` 환경에서 실행됩니다. `.env.migration` 파일에 데이터베이스 연결 정보를 설정해야 합니다.

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

## 마이그레이션 명령어

### 마이그레이션 생성 (빈 파일)

```bash
# 기본 경로에 생성 (src/common/database/migrations/migration.ts)
npm run migration:create

# 커스텀 경로에 생성
npm run migration:create:custom -- src/common/database/migrations/my-migration
```

### 마이그레이션 자동 생성 (Entity 변경 감지)

Entity 변경사항을 감지하여 자동으로 마이그레이션 파일을 생성합니다.

```bash
# 기본 경로에 생성
npm run migration:generate

# 커스텀 경로에 생성
npm run migration:generate:custom -- src/common/database/migrations/my-migration
```

### 마이그레이션 상태 확인

```bash
npm run migration:show
```

적용된 마이그레이션은 `[X]`, 미적용 마이그레이션은 `[ ]`로 표시됩니다.

### 마이그레이션 실행

```bash
# 마이그레이션 실행 (실제 DB 변경)
npm run migration:run

# 마이그레이션 실행 (DB 변경 없이 기록만)
npm run migration:run:fake
```

### 마이그레이션 롤백

```bash
# 가장 최근 마이그레이션 롤백
npm run migration:revert

# 롤백 기록만 (DB 변경 없이)
npm run migration:revert:fake
```

## 마이그레이션 파일 작성 예시

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailColumn1234567890123 implements MigrationInterface {
  name = 'AddUserEmailColumn1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD "email" character varying NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "email"
    `);
  }
}
```

## 프로덕션 배포 시 마이그레이션

### 방법 1: 수동 마이그레이션 (권장)

배포 전에 프로덕션 DB에 직접 마이그레이션을 실행합니다.

```bash
# 프로덕션 환경 변수 설정 후 실행
NODE_ENV=migration \
DB_HOST=prod-db-host \
DB_PORT=5432 \
DB_USERNAME=prod_user \
DB_PASSWORD=prod_password \
DB_DATABASE=prod_database \
npm run migration:run
```

### 방법 2: CI/CD 파이프라인에서 마이그레이션

GitHub Actions 워크플로우에 마이그레이션 단계를 추가합니다.

```yaml
# .github/workflows/cd-prod.yml 예시
jobs:
  deploy-prod:
    steps:
      # ... 기존 단계들 ...

      - name: Run Database Migrations
        env:
          DB_HOST: ${{ secrets.MEOGLE_PROD_DB_HOST }}
          DB_PORT: 5432
          DB_USERNAME: ${{ secrets.MEOGLE_PROD_PG_USERNAME }}
          DB_PASSWORD: ${{ secrets.MEOGLE_PROD_PG_PASSWORD }}
          DB_DATABASE: ${{ secrets.MEOGLE_PROD_PG_DATABASE }}
        run: |
          npm ci
          npm run migration:run
```

### 방법 3: Docker 컨테이너 시작 시 마이그레이션

Dockerfile 또는 docker-compose에서 앱 시작 전 마이그레이션을 실행합니다.

**Dockerfile 수정:**
```dockerfile
# 프로덕션 스테이지
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# 마이그레이션 파일 복사 (dist에 이미 포함됨)
USER node

EXPOSE 3001

# 시작 스크립트 사용
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
```

**docker-compose 수정:**
```yaml
services:
  was:
    environment:
      - NODE_ENV=prod
      - DB_HOST=${MEOGLE_PG_HOST}
      - DB_PORT=5432
      - DB_USERNAME=${MEOGLE_PG_USERNAME}
      - DB_PASSWORD=${MEOGLE_PG_PASSWORD}
      - DB_DATABASE=${MEOGLE_PG_DATABASE}
    command: sh -c "npm run migration:run && npm run start:prod"
```

### 방법 4: 별도 마이그레이션 Job 실행

Kubernetes 또는 Docker Compose에서 별도의 마이그레이션 Job을 실행합니다.

```yaml
# docker-compose.yml
services:
  migration:
    image: your-app-image:latest
    environment:
      - NODE_ENV=migration
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
    command: npm run migration:run
    depends_on:
      - db

  was:
    image: your-app-image:latest
    depends_on:
      migration:
        condition: service_completed_successfully
```

## 마이그레이션 베스트 프랙티스

### 1. 마이그레이션 파일 수정 금지

이미 커밋된 마이그레이션 파일은 절대 수정하지 않습니다. 변경이 필요하면 새로운 마이그레이션을 생성합니다.

### 2. 롤백 가능하게 작성

`down()` 메서드를 항상 구현하여 롤백이 가능하도록 합니다.

### 3. 작은 단위로 분리

하나의 마이그레이션에 너무 많은 변경을 포함하지 않습니다.

### 4. 데이터 마이그레이션 분리

스키마 변경과 데이터 마이그레이션은 별도의 파일로 분리합니다.

### 5. 배포 전 테스트

프로덕션 배포 전에 스테이징 환경에서 마이그레이션을 테스트합니다.

```bash
# 스테이징 환경에서 테스트
npm run migration:show  # 적용할 마이그레이션 확인
npm run migration:run   # 마이그레이션 실행
npm run migration:show  # 적용 결과 확인
```

### 6. 백업 필수

프로덕션 마이그레이션 전에 반드시 데이터베이스를 백업합니다.

```bash
# PostgreSQL 백업 예시
pg_dump -h localhost -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 문제 해결

### 마이그레이션 실패 시

1. 에러 메시지 확인
2. 마이그레이션 상태 확인: `npm run migration:show`
3. 필요시 수동으로 DB 수정 후 fake 실행: `npm run migration:run:fake`

### 마이그레이션 충돌 시

여러 브랜치에서 마이그레이션이 생성된 경우:

1. 모든 마이그레이션을 시간순으로 정렬
2. 충돌하는 마이그레이션 수정
3. 새로운 마이그레이션으로 통합

### 마이그레이션 기록 테이블

TypeORM은 `migrations` 테이블에 실행된 마이그레이션을 기록합니다.

```sql
SELECT * FROM migrations ORDER BY id;
```