import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type UserJwtPayload = { sub: string; role: 'user' };

/**
 * Guard пользователей сайта. Проверяет cookie user_token и роль user,
 * кладёт userId в request.userId для дальнейшего использования.
 */
@Injectable()
export class UserJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { userId?: string }>();
    const token = request.cookies?.user_token as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const payload = this.jwtService.verify<{ sub?: string; role?: string }>(token);
      if (payload.role !== 'user' || !payload.sub) {
        throw new UnauthorizedException('Insufficient permissions');
      }
      request.userId = payload.sub;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
