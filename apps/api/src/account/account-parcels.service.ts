import { Parcel, ParcelStatus } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { MyParcelsQuery } from './account-parcels.dto';

export type ParcelSummary = { total: number; byStatus: Record<ParcelStatus, number> };

/** Посылки текущего пользователя сайта: только свои, только чтение. */
@Injectable()
export class AccountParcelsService {
  constructor(
    @InjectRepository(Parcel)
    private readonly parcels: Repository<Parcel>,
  ) {}

  findMine(userId: string, query: MyParcelsQuery): Promise<Parcel[]> {
    const qb = this.parcels
      .createQueryBuilder('parcel')
      .where('parcel.userId = :userId', { userId })
      .orderBy('parcel.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('parcel.status = :status', { status: query.status });
    }
    if (query.q) {
      qb.andWhere('(parcel.trackNumber ILIKE :q OR parcel.description ILIKE :q)', {
        q: `%${query.q.replace(/[%_\\]/g, '\\$&')}%`,
      });
    }
    if (query.from) {
      qb.andWhere('parcel.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      // Дата «по» включительно — до конца дня.
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      qb.andWhere('parcel.createdAt <= :to', { to });
    }

    return qb.getMany();
  }

  async findMineOne(userId: string, id: string): Promise<Parcel> {
    const parcel = await this.parcels.findOne({
      where: { id, userId },
      relations: ['history'],
      order: { history: { createdAt: 'ASC' } },
    });
    if (!parcel) {
      throw new NotFoundException('Посылка не найдена');
    }
    return parcel;
  }

  async summary(userId: string): Promise<ParcelSummary> {
    const rows = await this.parcels
      .createQueryBuilder('parcel')
      .select('parcel.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .where('parcel.userId = :userId', { userId })
      .groupBy('parcel.status')
      .getRawMany<{ status: ParcelStatus; count: number }>();

    const byStatus = Object.fromEntries(
      Object.values(ParcelStatus).map((status) => [status, 0]),
    ) as Record<ParcelStatus, number>;
    let total = 0;
    for (const row of rows) {
      byStatus[row.status] = row.count;
      total += row.count;
    }
    return { total, byStatus };
  }
}
