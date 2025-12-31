import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import {
  signUpSchema,
  loginSchema,
  SignUpInput,
  LoginInput,
} from '@pack-do-pezin/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async signUp(@Body(new ZodValidationPipe(signUpSchema)) dto: SignUpInput) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginInput,
    @Res({ passthrough: true }) response: Response
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);

    // Set refresh token in HTTP-only cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { user, accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const oldRefreshToken = request.cookies?.refreshToken;

    const { accessToken, refreshToken } =
      await this.authService.refresh(oldRefreshToken);

    // Set new refresh token in cookie (rotation)
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.cookies?.refreshToken;

    await this.authService.logout(refreshToken);

    // Clear cookie
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logout realizado com sucesso' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }
}
