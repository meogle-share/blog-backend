# 예외 처리 정책

## 구조

```
<<interface>> ResolvableException
  code: ExceptionCode
  message: string
  metadata?: Record<string, unknown>

DomainException (abstract, extends Error, implements ResolvableException)
├── InvalidPostException    — CONTENT.INVALID_POST
├── InvalidUserException    — IAM.INVALID_USER
└── InvalidAccountException — IAM.INVALID_ACCOUNT

ApplicationException (abstract, extends Error, implements ResolvableException)
├── ValidationException     — COMMON.VALIDATION_ERROR, "Validation failed"
├── NotFoundException       — COMMON.NOT_FOUND, "Resource not found"
├── UnauthorizedException   — COMMON.UNAUTHORIZED, "Unauthorized" (코드 오버라이드 가능)
├── ConflictException       — COMMON.CONFLICT, "Resource already exists"
├── ForbiddenException      — COMMON.FORBIDDEN, "Access denied"
└── InternalException       — COMMON.INTERNAL_ERROR, "Internal server error"
```

- `DomainException`과 `ApplicationException`은 독립적인 계층이며, 공유하는 것은 `ResolvableException` 인터페이스뿐이다
- 예외 클래스는 프로토콜에 종속되지 않는다 (`HttpException`을 상속하지 않음)
- 도메인 레이어에서는 `DomainException`, 애플리케이션 레이어에서는 `ApplicationException` 하위 클래스를 던진다
- NestJS 내장 예외(`HttpException` 등)를 직접 던지지 않는다
- 각 예외는 영어 기본 메시지를 가진다. 상황에 맞는 구체적 메시지가 있으면 오버라이드한다

## message와 code의 역할

| | `code` | `message` |
|---|---|---|
| 용도 | 프론트 분기용 (다국어 키) | 개발자용 폴백 |
| 언어 | enum 코드 | 영어 |
| 프론트 사용 | `code`로 i18n 메시지 매핑 | `code` 매핑 실패 시 폴백으로 노출 |

- 프론트는 `code`를 기준으로 사용자에게 보여줄 메시지를 결정한다
- `message`는 개발자 디버깅 및 폴백 용도이므로 영어로 작성한다

## ExceptionCode

`ExceptionCode` enum으로 관리한다 (`exception-code.enum.ts`). 형식은 `{도메인}.{에러명}` (예: `COMMON.VALIDATION_ERROR`, `IAM.INVALID_CREDENTIALS`).

새 도메인 에러 추가 시:
1. `ExceptionCode` enum에 코드 추가
2. 필요하면 `DomainException` 또는 `ApplicationException` 하위 클래스 생성
3. `http/http-status.map.ts`에 HTTP status 매핑 추가

## 아키텍처 — 프로토콜 무관 설계

```
Exception (code, message, metadata)
    ↓
ExceptionResolver          ← 공통: 예외 → ResolvedError 추출
    ↓
┌─────────────────────────────────┐
│  HttpExceptionFilter            │  → HttpErrorResponse (statusCode 포함)
│  WsExceptionFilter              │  → WS 포맷 (스텁)
│  GrpcExceptionFilter            │  → gRPC 포맷 (스텁)
└─────────────────────────────────┘
```

### ExceptionResolver

모든 예외를 프로토콜 무관한 `ResolvedError`로 변환하는 공통 서비스.

처리 순서:
1. `ResolvableException` (`DomainException`, `ApplicationException`) → 해당 code, message, metadata 추출
2. `HttpException` (NestJS 내장) → status→code 매핑, message 추출
3. 알 수 없는 예외 → `INTERNAL_ERROR`

### HttpExceptionFilter

`APP_FILTER`로 `AppModule`에 등록된 HTTP 전용 예외 필터. `ExceptionResolver`로 에러 정보를 추출하고, `http-status.map`으로 HTTP status를 결정한다.

### 로깅

- 500 이상: `logger.error()` — 원본 예외 포함
- 400대: `logger.warn()` — code + message

## HttpErrorResponse (HTTP 응답 형식)

HTTP 에러 응답은 아래 형식으로 통일한다:

```json
{
  "statusCode": 400,
  "code": "COMMON.VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2026-03-22T12:00:00.000Z",
  "metadata": {}
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `statusCode` | number | O | HTTP 상태 코드 |
| `code` | string | O | 비즈니스 에러 코드 (프론트 분기용) |
| `message` | string | O | 개발자용 폴백 메시지 (영어) |
| `timestamp` | string | O | ISO 8601 형식 |
| `metadata` | object | X | 부가 정보 (검증 실패 필드 등) |

## 프로토콜 확장

새 프로토콜 추가 시:
1. `{protocol}/` 디렉토리에 필터 + 응답 DTO 생성
2. 필요하면 status 매핑 함수 추가 (예: `toGrpcStatus()`)
3. **예외 클래스는 수정하지 않는다**