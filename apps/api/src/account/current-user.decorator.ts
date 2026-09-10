import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

/** Достаёт userId, положенный UserJwtAuthGuard в request. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { userId?: string }>();
    return request.userId ?? '';
  },
);
