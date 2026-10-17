import { CurrentUserId } from '@/account/current-user.decorator';
import { UserJwtAuthGuard } from '@/account/user-jwt-auth.guard';
import type { Notification } from '@app/database';
import { Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('account/notifications')
@UseGuards(UserJwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findMine(@CurrentUserId() userId: string): Promise<Notification[]> {
    return this.service.findMine(userId);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUserId() userId: string): Promise<{ count: number }> {
    return { count: await this.service.countUnread(userId) };
  }

  @Post('read-all')
  @HttpCode(204)
  readAll(@CurrentUserId() userId: string): Promise<void> {
    return this.service.markAllRead(userId);
  }

  @Post(':id/read')
  @HttpCode(204)
  read(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.markRead(userId, id);
  }
}
