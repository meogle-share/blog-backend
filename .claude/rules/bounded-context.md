# Bounded Context 및 Aggregate 경계

## IAM Bounded Context

Auth 모듈과 User 모듈은 같은 Bounded Context(IAM)에 속한다. 같은 BC 내에서는 도메인 객체(VO, Aggregate)를 직접 import하여 사용할 수 있다.

### Aggregate 구조

```
Account (Aggregate Root) — Auth 모듈
├── oauthAccounts: OAuthAccount[] (Entity)
└── passwordCredential: PasswordCredential | null (Entity)

User (Aggregate Root) — User 모듈
├── accountId: string ← Account.id 참조 (ID 기반)
├── nickname: UserNickName
└── email: UserEmail | null
```

### 원칙

1. **Repository는 Aggregate Root 단위**: OAuthAccount, PasswordCredential에 대한 별도 Repository를 만들지 않는다. AccountRepository를 통해서만 접근한다.
2. **Aggregate 간 ID 참조**: User는 `accountId`로 Account를 참조한다. 도메인 객체를 직접 포함하지 않는다.
3. **불변식은 Aggregate 내부에서 강제**: "최소 하나의 인증 수단"은 `Account.createWithOAuth()`, `Account.createWithPassword()` 팩토리 메서드로 보장한다.
4. **같은 BC 내 VO 공유 허용**: Auth가 `UserEmail`, `UserNickName` 등 User 모듈의 VO를 사용하는 것은 허용된다.

### UseCase 흐름

- 신규 가입: Account 생성 → User 생성(accountId 참조) → User 반환
- 로그인: Account 조회 → credential 검증 → User 조회 → User 반환
- JWT/Controller는 User를 기반으로 동작 (같은 BC이므로 직접 참조 가능)