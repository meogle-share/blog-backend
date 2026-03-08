import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { AccountUsername } from '../../domain/models/account-username.vo';
import { AccountPassword } from '../../domain/models/account-password.vo';

export class LoginRequestDto {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Length(AccountUsername.MIN_LENGTH, AccountUsername.MAX_LENGTH)
  username: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
  })
  @IsNotEmpty()
  @Length(AccountPassword.MIN_LENGTH, AccountPassword.MAX_LENGTH)
  password: string;
}
