import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({
    description: '유저 고유 식별자',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: '닉네임',
    example: '김진명',
  })
  nickname!: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
    nullable: true,
  })
  email!: string | null;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '인증에 사용되는 JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: '로그인한 유저 정보',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}
