import { NotificationsService } from '@/notifications/notifications.service';
import { NotificationType, Parcel, ParcelStatus, ParcelStatusHistory } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { CreateParcelDto, UpdateParcelDto } from './parcel.dto';

export interface PublicTracking {
  trackNumber: string;
  status: ParcelStatus;
  updatedAt: Date;
  history: Array<{ status: ParcelStatus; createdAt: Date }>;
}

@Injectable()
export class ParcelsService {
  constructor(
    @InjectRepository(Parcel)
    private readonly repository: Repository<Parcel>,
    @InjectRepository(ParcelStatusHistory)
    private readonly history: Repository<ParcelStatusHistory>,
    private readonly notifications: NotificationsService,
  ) {}

  findAll(): Promise<Parcel[]> {
    return this.repository.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  /** Поиск по трек-номеру без учёта регистра; только публичные поля. */
  async findPublicTracking(trackNumber: string): Promise<PublicTracking | null> {
    const parcel = await this.repository
      .createQueryBuilder('parcel')
      .leftJoinAndSelect('parcel.history', 'history')
      .where('LOWER(parcel.trackNumber) = LOWER(:trackNumber)', { trackNumber })
      .orderBy('history.createdAt', 'ASC')
      .getOne();
    if (!parcel) return null;
    return {
      trackNumber: parcel.trackNumber,
      status: parcel.status,
      updatedAt: parcel.updatedAt,
      history: (parcel.history ?? []).map((h) => ({ status: h.status, createdAt: h.createdAt })),
    };
  }

  async findOne(id: string): Promise<Parcel> {
    const parcel = await this.repository.findOne({
      where: { id },
      relations: ['user', 'history'],
      order: { history: { createdAt: 'ASC' } },
    });
    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }
    return parcel;
  }

  async create(dto: CreateParcelDto): Promise<Parcel> {
    const parcel = await this.repository.save(this.repository.create(dto));
    await this.history.save(this.history.create({ parcelId: parcel.id, status: parcel.status }));
    await this.notifyStatus(parcel);
    return parcel;
  }

  async update(id: string, dto: UpdateParcelDto): Promise<Parcel> {
    const parcel = await this.repository.findOne({ where: { id } });
    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }
    const statusChanged = dto.status !== undefined && dto.status !== parcel.status;
    Object.assign(parcel, dto);
    const saved = await this.repository.save(parcel);
    // Клиент видит смену статуса в таймлайне кабинета.
    if (statusChanged) {
      await this.history.save(this.history.create({ parcelId: saved.id, status: saved.status }));
      await this.notifyStatus(saved);
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    const parcel = await this.findOne(id);
    await this.repository.remove(parcel);
  }

  private notifyStatus(parcel: Parcel): Promise<void> {
    return this.notifications.notify(
      parcel.userId,
      NotificationType.PARCEL_STATUS,
      { track: parcel.trackNumber, status: parcel.status },
      `/account/parcels/${parcel.id}`,
    );
  }
}
