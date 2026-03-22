# 네이밍 컨벤션

## 인프라 구현체 파일

포트(인터페이스)의 구현체 파일명은 `{port이름}.{구현체이름}.ts` 형식을 따른다.

| 포트 | 구현체 파일 |
|------|------------|
| `logger.port.ts` | `logger.winston.ts` |
| `token-provider.port.ts` | `token-provider.jwt.ts` |
| `password-hasher.port.ts` | `password-hasher.argon2.ts` |

클래스명에는 `Impl`, `Adapter` 같은 접미사를 붙이지 않는다. 구현 기술명 + 역할명으로 명명한다.

- `WinstonLogger` (O)
- `WinstonLoggerAdapter` (X)
- `WinstonLoggerImpl` (X)