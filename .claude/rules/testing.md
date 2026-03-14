# 테스트 가이드

## 파일 구조

| 유형 | 네이밍 | 위치 |
|------|--------|------|
| 단위 테스트 | `*.spec.ts` | 소스 파일 옆 (co-located) |
| 통합 테스트 | `*.integration.spec.ts` | 모듈 내 `__tests__/` 디렉토리 |
| E2E 테스트 | `*.e2e.spec.ts` | 모듈 내 `__tests__/` 디렉토리 |

```
src/modules/content/post/
├── domain/models/
│   ├── post.aggregate.ts
│   └── post.aggregate.spec.ts        ← 단위 테스트: 소스 옆
├── application/commands/
│   └── create-post.handler.spec.ts   ← 단위 테스트: 소스 옆
└── __tests__/
    ├── create-post.handler.integration.spec.ts  ← 통합 테스트
    └── post.http.controller.integration.spec.ts
```

## 실행 명령

```bash
npm run test:unit      # 단위 테스트
npm run test:unit:cov  # 단위 테스트 + 커버리지 측정
npm run test:int       # 통합 테스트 (Docker PostgreSQL 자동 기동)
npm run test:e2e       # E2E 테스트
```

## 레이어별 테스트 패턴

### Domain (단위 테스트)

외부 의존성 없이 순수 로직만 테스트한다. mock 불필요.

```typescript
describe('PostTitle', () => {
  it('빈 문자열이면 예외를 던진다', () => {
    expect(() => PostTitle.from('')).toThrow();
  });
});
```

### Application (단위 테스트)

핸들러를 `Test.createTestingModule()`으로 구성하고, 리포지토리는 `jest.fn()`으로 mock한다.

```typescript
const module = await Test.createTestingModule({
  providers: [
    CreatePostHandler,
    { provide: POST_REPOSITORY, useValue: { save: jest.fn() } },
  ],
}).compile();
```

### Infrastructure (단위 테스트)

Mapper의 양방향 변환(`toDomain`, `toModel`)을 테스트한다.

### Integration / E2E (통합 테스트)

실제 DB를 사용한다. mock으로 대체하지 않는다.

- `beforeAll` — 모듈·리포지토리 셋업
- `beforeEach` — `truncate()`로 테이블 초기화, 팩토리로 테스트 데이터 생성
- `afterAll` — 모듈 종료

```typescript
// HTTP 통합 테스트
request(app.getHttpServer())
  .post('/v1/posts')
  .send(dto)
  .expect(201);
```

## 테스트 인프라

### 팩토리

`src/libs/typeorm/factories/`에 위치. 테스트 데이터 생성에 사용한다.

- `create(count, override?)` — 레코드 생성
- `reset()` — 시퀀스 카운터 초기화 (`beforeEach`에서 호출)

### 헬퍼

- `test/support/database.helper.ts` — `truncate(repositories)`: 테이블 CASCADE 초기화
- `test/setup/global-setup.ts` — Docker PostgreSQL 컨테이너 기동 + 마이그레이션
- `test/setup/global-teardown.ts` — 컨테이너 정리

## 테스트 작성 원칙

1. **테스트 설명은 한글로 작성**: `it('새 세션을 생성하고 반환한다', ...)`
2. **Arrange-Act-Assert 패턴 준수**: 준비 → 실행 → 검증 순서를 지킨다
3. **테스트당 하나의 행위 검증**: 하나의 `it` 블록에서 하나의 동작만 확인한다
4. **테스트 격리**: 각 테스트는 독립적으로 실행 가능해야 하며, 다른 테스트의 상태에 의존하지 않는다

## 커버리지 정책

### 필수 테스트 범위

- 프로덕션 코드 변경 시 해당 코드의 테스트를 같은 커밋에 포함한다
- 도메인 레이어(VO, Aggregate)는 단위 테스트 필수
- 핸들러는 성공 경로 + 주요 에러 경로를 커버한다

### 임계값

statements, branches, functions, lines 모두 **80% 이상**을 유지한다.

- 측정 대상: `src/` 하위 `.ts` 파일
- **제외**: `main.ts`, `*.module.ts` 등 로직이 없는 설정/부트스트랩 파일

### 원칙

1. **새 코드는 임계값 이상**: 새 기능 추가나 버그 수정 시 해당 코드의 커버리지가 임계값(80%) 이상이어야 한다
2. **무의미한 테스트 지양**: 커버리지 숫자를 채우기 위한 구현 세부사항 검증, getter/setter만 호출하는 테스트는 작성하지 않는다
3. **분기 커버리지 우선**: 에러 경로, 경계값, 엣지 케이스를 우선 커버한다 — branch coverage가 가장 실질적인 품질 지표다