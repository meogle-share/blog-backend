import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
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
