class AccountResponseDto {
  id: string;
  username: string;
}

export class LoginResponseDto {
  accessToken: string;
  account: AccountResponseDto;
}
