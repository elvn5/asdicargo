import { estimateShippingCost } from '@/common/shipping-cost';
import { NotificationsService } from '@/notifications/notifications.service';
import { ParcelsService } from '@/parcels/parcels.service';
import {
  NotificationType,
  ParcelStatus,
  ShipmentRequest,
  ShipmentRequestStatus,
} from '@app/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type {
  AdminRequestsQuery,
  ConvertShipmentRequestDto,
  CreateShipmentRequestDto,
  UpdateShipmentRequestDto,
} from './shipment-request.dto';

// Защита от спама: не больше стольких необработанных заявок на пользователя.
const MAX_OPEN_REQUESTS = 20;

@Injectable()
export class ShipmentRequestsService {
  constructor(
    @InjectRepository(ShipmentRequest)
    private readonly requests: Repository<ShipmentRequest>,
    private readonly parcels: ParcelsService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- Клиент ----------------

  findMine(userId: string): Promise<ShipmentRequest[]> {
    return this.requests.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findMineOne(userId: string, id: string): Promise<ShipmentRequest> {
    const request = await this.requests.findOne({ where: { id, userId } });
    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }
    return request;
  }

  async create(userId: string, dto: CreateShipmentRequestDto): Promise<ShipmentRequest> {
    const open = await this.requests.count({
      where: { userId, status: ShipmentRequestStatus.NEW },
    });
    if (open >= MAX_OPEN_REQUESTS) {
      throw new BadRequestException('Слишком много необработанных заявок');
    }

    const volume = dto.volumeM3 ?? null;
    return this.requests.save(
      this.requests.create({
        ...dto,
        userId,
        weightKg: String(dto.weightKg),
        volumeM3: volume === null ? null : String(volume),
        // Стоимость считаем на сервере — клиентской цифре не доверяем.
        estimatedCostSom: estimateShippingCost(dto.weightKg, volume),
        pickupAddress: dto.pickupRequired ? (dto.pickupAddress ?? null) : null,
        comment: dto.comment ?? null,
      }),
    );
  }

  /** Клиент может отменить заявку, пока менеджер её не взял в работу. */
  async cancelMine(userId: string, id: string): Promise<ShipmentRequest> {
    const request = await this.findMineOne(userId, id);
    if (request.status !== ShipmentRequestStatus.NEW) {
      throw new BadRequestException('Заявку уже нельзя отменить');
    }
    request.status = ShipmentRequestStatus.CANCELLED;
    return this.requests.save(request);
  }

  // ---------------- Админ ----------------

  findAll(query: AdminRequestsQuery): Promise<ShipmentRequest[]> {
    return this.requests.find({
      where: query.status ? { status: query.status } : {},
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ShipmentRequest> {
    const request = await this.requests.findOne({ where: { id }, relations: ['user'] });
    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }
    return request;
  }

  async update(id: string, dto: UpdateShipmentRequestDto): Promise<ShipmentRequest> {
    const request = await this.findOne(id);
    const statusChanged = dto.status !== undefined && dto.status !== request.status;
    const replied =
      dto.managerComment !== undefined &&
      Boolean(dto.managerComment) &&
      dto.managerComment !== request.managerComment;
    if (dto.status !== undefined) request.status = dto.status;
    if (dto.managerComment !== undefined) request.managerComment = dto.managerComment;
    const saved = await this.requests.save(request);

    // Одно уведомление на изменение: смена статуса важнее нового ответа.
    const link = `/account/requests/${saved.id}`;
    if (statusChanged) {
      await this.notifications.notify(
        saved.userId,
        NotificationType.REQUEST_STATUS,
        { number: saved.number, status: saved.status },
        link,
      );
    } else if (replied) {
      await this.notifications.notify(
        saved.userId,
        NotificationType.REQUEST_REPLY,
        { number: saved.number },
        link,
      );
    }
    return saved;
  }

  /**
   * Груз принят: создаём посылку из заявки и закрываем заявку.
   * Клиент получит уведомление о новой посылке от ParcelsService.
   */
  async convertToParcel(id: string, dto: ConvertShipmentRequestDto): Promise<ShipmentRequest> {
    const request = await this.findOne(id);
    if (request.parcelId) {
      throw new BadRequestException('По заявке уже создана посылка');
    }
    if (
      [ShipmentRequestStatus.CANCELLED, ShipmentRequestStatus.REJECTED].includes(request.status)
    ) {
      throw new BadRequestException('Заявка отменена или отклонена');
    }

    const parcel = await this.parcels.create({
      userId: request.userId,
      trackNumber: dto.trackNumber,
      description: request.cargoDescription,
      status: ParcelStatus.CREATED,
      // numeric из БД приходит как «30.00» — в посылке храним без хвостовых нулей.
      weightKg: String(Number(request.weightKg)),
      volumeM3: request.volumeM3 === null ? null : String(Number(request.volumeM3)),
      costSom: String(request.estimatedCostSom),
      comment: null,
    });

    request.parcelId = parcel.id;
    request.status = ShipmentRequestStatus.COMPLETED;
    return this.requests.save(request);
  }
}
