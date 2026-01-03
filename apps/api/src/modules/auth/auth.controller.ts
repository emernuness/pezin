import {
  Controller,
  Post,
  Patch,
  Delete,
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
  updateProfileSchema,
  UpdateProfileInput,
  changePasswordSchema,
  ChangePasswordInput,
  updateCreatorProfileSchema,
  UpdateCreatorProfileInput,
  updatePixKeySchema,
  UpdatePixKeyInput,
} from '@pack-do-pezin/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CsrfGuard } from '@/common/guards/csrf.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('csrf-token')
  getCsrfToken(@Res({ passthrough: true }) response: Response) {
    // Generate CSRF token and set in cookie
    const token = CsrfGuard.generateToken();
    response.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be readable by JavaScript
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
    return { csrfToken: token };
  }

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
      secure: true, // Always use HTTPS - even in dev, use HTTPS proxy if needed
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
      secure: true, // Always use HTTPS
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
      secure: true, // Always use HTTPS
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
    return this.authService.getMe(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileInput
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Patch('creator-profile')
  @UseGuards(JwtAuthGuard)
  async updateCreatorProfile(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(updateCreatorProfileSchema)) dto: UpdateCreatorProfileInput
  ) {
    return this.authService.updateCreatorProfile(user.id, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async changePassword(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordInput
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  // Profile Image Upload Endpoints
  @Post('profile-image/upload-url')
  @UseGuards(JwtAuthGuard)
  async getProfileImageUploadUrl(
    @CurrentUser() user: any,
    @Body() body: { contentType: string; imageType?: 'profile' | 'cover' }
  ) {
    return this.authService.getProfileImageUploadUrl(
      user.id,
      body.contentType,
      body.imageType || 'profile'
    );
  }

  @Post('profile-image/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmProfileImageUpload(
    @CurrentUser() user: any,
    @Body() body: { key: string; imageType?: 'profile' | 'cover' }
  ) {
    return this.authService.confirmProfileImageUpload(
      user.id,
      body.key,
      body.imageType || 'profile'
    );
  }

  // Email Verification Endpoints
  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async resendVerificationEmail(@CurrentUser() user: any) {
    return this.authService.resendVerificationEmail(user.id);
  }

  // PIX Key Endpoints
  @Patch('pix-key')
  @UseGuards(JwtAuthGuard)
  async updatePixKey(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(updatePixKeySchema)) dto: UpdatePixKeyInput
  ) {
    return this.authService.updatePixKey(user.id, dto);
  }

  @Delete('pix-key')
  @UseGuards(JwtAuthGuard)
  async removePixKey(@CurrentUser() user: any) {
    return this.authService.removePixKey(user.id);
  }
}
