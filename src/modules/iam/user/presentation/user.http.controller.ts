import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from '@nestjs/common';
import type { Request as RequestType } from 'express';
import { User } from '../domain/models/user.aggregate';
import { UserProfileResponseDto } from './dto/user-profile.response.dto';

@Controller({ path: 'users', version: '1' })
export class UserHttpController {
  @ApiOperation({ summary: '로그인한 본인 정보 조회' })
  @ApiResponse({ status: HttpStatus.OK, type: UserProfileResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: RequestType): UserProfileResponseDto {
    const user = req.user as User;
    return {
      id: user.id,
      nickname: user.getProps().nickname.value,
      email: user.getProps().email?.value ?? null,
    };
  }
}
