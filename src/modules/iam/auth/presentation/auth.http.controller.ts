import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequestDto } from '@modules/iam/auth/presentation/dto/login.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponseDto } from '@modules/iam/auth/presentation/dto/login.response.dto';
import { Request } from '@nestjs/common';
import type { Request as RequestType } from 'express';

@Controller({ path: 'auth', version: '1' })
export class AuthHttpController {
  constructor() {}

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
    return {
      accessToken: 'temp-token', // TODO: JWT 구현 후 교체
      account: {
        id: user.id.value,
        username: user.getProps().username.value,
      },
    };
  }
}
