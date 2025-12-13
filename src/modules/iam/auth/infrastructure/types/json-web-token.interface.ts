/**
 * JWT 표준 클레임 (RFC 7519)
 */
export interface JwtStandardClaims {
  /** Issuer - 토큰 발급자 */
  iss?: string;

  /** Subject - 토큰 대상 (user id) */
  sub: string;

  /** Audience - 토큰 수신자 */
  aud?: string | string[];

  /** Expiration Time - 만료 시간 (Unix timestamp) */
  exp: number;

  /** Not Before - 활성화 시간 (Unix timestamp) */
  nbf?: number;

  /** Issued At - 발급 시간 (Unix timestamp) */
  iat: number;

  /** JWT ID - 토큰 고유 식별자 */
  jti?: string;
}

/**
 * JWT Access Token Payload (디코딩/검증 후)
 */
export interface JwtAccessTokenPayload extends JwtStandardClaims {
  username: string;
}

/**
 * JWT Access Token 서명 시 입력 (exp, iat는 JwtModule이 자동 추가)
 */
export type JwtAccessTokenInput = Pick<JwtAccessTokenPayload, 'sub' | 'username'>;
