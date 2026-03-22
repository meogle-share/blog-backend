import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequestDto } from './dto/login.request.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoginResponseDto } from './dto/login.response.dto';
import { Request } from '@nestjs/common';
import { TOKEN_PROVIDER } from '../auth.tokens';
import type { TokenProvider } from '../domain/ports/token-provider.port';
import type { Request as RequestType, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from '@modules/iam/user/domain/models/user.aggregate';

@Controller({ path: 'auth', version: '1' })
export class AuthHttpController {
  constructor(
    @Inject(TOKEN_PROVIDER)
    private readonly tokenService: TokenProvider,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: '사용자 자격증명 로그인' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(
    @Body() dto: LoginRequestDto,
    @Request() req: RequestType,
    @Res({ passthrough: true }) res: Response,
  ): LoginResponseDto {
    const user = req.user as User;
    const accessToken = this.tokenService.generate(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        nickname: user.getProps().nickname.value,
        email: user.getProps().email?.value ?? null,
      },
    };
  }

  @ApiOperation({ summary: 'GitHub OAuth 로그인 시작' })
  @Get('github')
  @UseGuards(AuthGuard('github'))
  github() {
    // Passport가 GitHub으로 리다이렉트 처리
  }

  @ApiOperation({ summary: 'GitHub OAuth 콜백' })
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Request() req: RequestType, @Res() res: Response) {
    const user = req.user as User;
    const accessToken = this.tokenService.generate(user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    const redirectUrl = this.configService.get<string>('GITHUB_FRONTEND_REDIRECT_URL');
    res.redirect(redirectUrl!);
  }
}
