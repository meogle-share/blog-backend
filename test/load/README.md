# 부하테스트 실행 가이드

## K6 설치

```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6
```

## 실행 순서

### 1. DB 컨테이너 실행
```bash
docker run --name meogle.pg.test.load \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=load_test \
  -e POSTGRES_DB=load_test \
  -p 9999:5432 \
  -d postgres:18
```

### 2. 마이그레이션 실행 (스키마 초기화)

컨테이너 실행 후 마이그레이션을 실행하여 테이블 스키마를 생성합니다.

부하테스트용 환경 파일(`test/load/.env.load`)을 사용하여 마이그레이션 실행:

```bash
set -a && source test/load/.env.test.load && set +a && npm run migration:run
```

### 3. 시드 데이터 삽입
#### 방법 1: nest-commander CLI 사용 (권장)

Factory를 활용하여 타입 안전하게 시드 데이터를 생성합니다.

```bash
# 기본 옵션 (사용자 10명, 게시글 100개)
npm run seed:load-test

# 커스텀 옵션
npm run seed:load-test -- --users=50 --posts=500

# 기존 데이터 삭제 후 생성
npm run seed:load-test -- --clean
```

**CLI 옵션:**
- `-u, --users <number>`: 생성할 사용자 수 (기본값: 10)
- `-p, --posts <number>`: 생성할 게시글 수 (기본값: 100)
- `-c, --clean`: 기존 데이터 삭제 후 생성 (`TRUNCATE CASCADE`)

**장점:**
- Factory 재사용으로 일관성 유지
- TypeScript 타입 안정성
- 유연한 데이터 개수 조절
- Repository 패턴 활용


**주의:** 기존 데이터가 모두 삭제됩니다 (`TRUNCATE CASCADE`)

### 4. 서버 실행

부하테스트용 환경 파일을 사용하여 서버 실행:

```bash
set -a && source test/load/.env.test.load && set +a && npm run start:dev
```

### 5. 부하테스트 실행

```bash
# 게시글 생성 테스트 (Write)
k6 run test/load/post/post-create-load-test.js

# 게시글 조회 테스트 (Read)
k6 run test/load/post/post-get-load-test.js

# 다른 서버 대상
k6 run -e BASE_URL=http://localhost:3000 test/load/post/post-create-load-test.js
```

## 테스트 구성

### 게시글 생성 (`post-create-load-test.js`)
- 최대 부하: 30 VU
- 성능 목표: 95% < 800ms, 에러율 < 5%

### 게시글 조회 (`post-get-load-test.js`)
- 최대 부하: 100 VU
- 성능 목표: 95% < 300ms, 에러율 < 1%