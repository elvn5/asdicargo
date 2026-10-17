import { Notification, type NotificationType } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, type Repository } from 'typeorm';

const PAGE_SIZE = 50;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}

  /**
   * Создаёт уведомление. Ошибка здесь не должна ломать основное действие
   * (смену статуса и т. п.) — поэтому только логируем.
   */
  async notify(
    userId: string,
    type: NotificationType,
    params: Record<string, string | number>,
    link: string | null,
  ): Promise<void> {
    try {
      await this.notifications.save(this.notifications.create({ userId, type, params, link }));
    } catch (error) {
      this.logger.error({ err: error, userId, type }, 'Failed to create notification');
    }
  }

  findMine(userId: string): Promise<Notification[]> {
    return this.notifications.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: PAGE_SIZE,
    });
  }

  countUnread(userId: string): Promise<number> {
    return this.notifications.count({ where: { userId, readAt: IsNull() } });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.notifications.update({ id, userId, readAt: IsNull() }, { readAt: new Date() });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifications.update({ userId, readAt: IsNull() }, { readAt: new Date() });
  }
}
