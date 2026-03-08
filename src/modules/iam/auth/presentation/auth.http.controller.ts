import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequestDto } from './dto/login.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponseDto } from './dto/login.response.dto';
import { Request } from '@nestjs/common';
import { TOKEN_PROVIDER } from '../auth.tokens';
import type { TokenProvider } from '../domain/ports/token-provider.port';
import type { Request as RequestType } from 'express';

@Controller({ path: 'auth', version: '1' })
export class AuthHttpController {
  constructor(
    @Inject(TOKEN_PROVIDER)
    private readonly tokenService: TokenProvider,
  ) {}

  @ApiOperation({ summary: '사용자 자격증명 로그인' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Body() dto: LoginRequestDto, @Request() req: RequestType): LoginResponseDto {
    const user = req.user!;
    const accessToken = this.tokenService.generate(user);
    return {
      accessToken,
      account: {
        id: user.id,
        username: user.getProps().username.value,
      },
    };
  }
}
