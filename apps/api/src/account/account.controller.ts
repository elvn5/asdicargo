import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import {
  type LoginDto,
  type RegisterDto,
  type TelegramLoginDto,
  loginSchema,
  registerSchema,
  telegramLoginSchema,
} from './account.dto';
import { AccountService, type PublicUser } from './account.service';
import { CurrentUserId } from './current-user.decorator';
import { UserJwtAuthGuard } from './user-jwt-auth.guard';

const isProduction = process.env.NODE_ENV === 'production';
const USER_COOKIE = 'user_token';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 дней

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
};

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user, token } = await this.accountService.register(dto);
    res.cookie(USER_COOKIE, token, cookieOptions);
    return user;
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user, token } = await this.accountService.login(dto);
    res.cookie(USER_COOKIE, token, cookieOptions);
    return user;
  }

  @Post('telegram')
  @HttpCode(200)
  async telegram(
    @Body(new ZodValidationPipe(telegramLoginSchema)) dto: TelegramLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user, token } = await this.accountService.loginWithTelegram(dto);
    res.cookie(USER_COOKIE, token, cookieOptions);
    return user;
  }

  @Get('me')
  @UseGuards(UserJwtAuthGuard)
  me(@CurrentUserId() userId: string): Promise<PublicUser> {
    return this.accountService.getProfile(userId);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): { success: true } {
    res.clearCookie(USER_COOKIE);
    return { success: true };
  }
}
