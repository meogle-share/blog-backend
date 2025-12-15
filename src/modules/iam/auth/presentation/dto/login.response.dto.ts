import { ApiProperty } from '@nestjs/swagger';

class AccountResponseDto {
  @ApiProperty({
    description: '계정 고유 식별자',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '사용자명',
    example: '김진명',
  })
  username: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '인증에 사용되는 JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '로그인한 계정 정보',
    type: AccountResponseDto,
  })
  account: AccountResponseDto;
}
