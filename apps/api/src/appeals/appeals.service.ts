import { NotificationsService } from '@/notifications/notifications.service';
import {
  Appeal,
  AppealAuthor,
  AppealMessage,
  AppealStatus,
  NotificationType,
  Parcel,
} from '@app/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type {
  AdminAppealsQuery,
  AppealMessageDto,
  CreateAppealDto,
  UpdateAppealDto,
} from './appeal.dto';

// Защита от спама: не больше стольких открытых обращений на пользователя.
const MAX_OPEN_APPEALS = 10;

@Injectable()
export class AppealsService {
  constructor(
    @InjectRepository(Appeal)
    private readonly appeals: Repository<Appeal>,
    @InjectRepository(AppealMessage)
    private readonly messages: Repository<AppealMessage>,
    @InjectRepository(Parcel)
    private readonly parcels: Repository<Parcel>,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- Клиент ----------------

  findMine(userId: string): Promise<Appeal[]> {
    return this.appeals.find({
      where: { userId },
      relations: ['parcel'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async findMineOne(userId: string, id: string): Promise<Appeal> {
    const appeal = await this.appeals.findOne({
      where: { id, userId },
      relations: ['parcel', 'messages'],
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!appeal) {
      throw new NotFoundException('Обращение не найдено');
    }
    return appeal;
  }

  async create(userId: string, dto: CreateAppealDto): Promise<Appeal> {
    const open = await this.appeals.count({ where: { userId, status: AppealStatus.OPEN } });
    if (open >= MAX_OPEN_APPEALS) {
      throw new BadRequestException('Слишком много открытых обращений');
    }
    // Привязать можно только свою посылку.
    if (dto.parcelId) {
      const parcel = await this.parcels.findOne({ where: { id: dto.parcelId, userId } });
      if (!parcel) {
        throw new BadRequestException('Посылка не найдена');
      }
    }

    const appeal = await this.appeals.save(
      this.appeals.create({
        userId,
        category: dto.category,
        subject: dto.subject,
        parcelId: dto.parcelId ?? null,
      }),
    );
    await this.messages.save(
      this.messages.create({ appealId: appeal.id, author: AppealAuthor.CLIENT, body: dto.message }),
    );
    return this.findMineOne(userId, appeal.id);
  }

  /** Сообщение клиента возвращает обращение в «ждёт ответа». */
  async replyAsClient(userId: string, id: string, dto: AppealMessageDto): Promise<Appeal> {
    const appeal = await this.findMineOne(userId, id);
    if (appeal.status === AppealStatus.CLOSED) {
      throw new BadRequestException('Обращение закрыто');
    }
    await this.addMessage(appeal, AppealAuthor.CLIENT, dto.body, AppealStatus.OPEN);
    return this.findMineOne(userId, id);
  }

  async closeMine(userId: string, id: string): Promise<Appeal> {
    const appeal = await this.findMineOne(userId, id);
    appeal.status = AppealStatus.CLOSED;
    await this.appeals.save(appeal);
    return this.findMineOne(userId, id);
  }

  // ---------------- Админ ----------------

  findAll(query: AdminAppealsQuery): Promise<Appeal[]> {
    return this.appeals.find({
      where: query.status ? { status: query.status } : {},
      relations: ['user', 'parcel'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Appeal> {
    const appeal = await this.appeals.findOne({
      where: { id },
      relations: ['user', 'parcel', 'messages'],
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!appeal) {
      throw new NotFoundException('Обращение не найдено');
    }
    return appeal;
  }

  async replyAsManager(id: string, dto: AppealMessageDto): Promise<Appeal> {
    const appeal = await this.findOne(id);
    await this.addMessage(appeal, AppealAuthor.MANAGER, dto.body, AppealStatus.ANSWERED);
    await this.notifications.notify(
      appeal.userId,
      NotificationType.APPEAL_REPLY,
      { number: appeal.number },
      `/account/appeals/${appeal.id}`,
    );
    return this.findOne(id);
  }

  async update(id: string, dto: UpdateAppealDto): Promise<Appeal> {
    const appeal = await this.findOne(id);
    appeal.status = dto.status;
    await this.appeals.save(appeal);
    return this.findOne(id);
  }

  private async addMessage(
    appeal: Appeal,
    author: AppealAuthor,
    body: string,
    status: AppealStatus,
  ): Promise<void> {
    await this.messages.save(this.messages.create({ appealId: appeal.id, author, body }));
    // Обновляем только нужные поля, чтобы не пересохранять загруженные связи.
    await this.appeals.update(appeal.id, { status, lastMessageAt: new Date() });
  }
}
