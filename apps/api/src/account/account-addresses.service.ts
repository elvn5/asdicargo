import { UserAddress } from '@app/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { UserAddressDto } from './account-addresses.dto';

// Защита от бесконечного роста адресной книги.
const MAX_ADDRESSES = 30;

/** Адресная книга текущего пользователя. Адрес по умолчанию — не более одного. */
@Injectable()
export class AccountAddressesService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly addresses: Repository<UserAddress>,
  ) {}

  findMine(userId: string): Promise<UserAddress[]> {
    return this.addresses.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async create(userId: string, dto: UserAddressDto): Promise<UserAddress> {
    const count = await this.addresses.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) {
      throw new BadRequestException(`Можно сохранить не более ${MAX_ADDRESSES} адресов`);
    }
    // Первый адрес автоматически становится адресом по умолчанию.
    const isDefault = dto.isDefault || count === 0;
    if (isDefault) await this.clearDefault(userId);
    return this.addresses.save(
      this.addresses.create({ ...dto, comment: dto.comment ?? null, userId, isDefault }),
    );
  }

  async update(userId: string, id: string, dto: UserAddressDto): Promise<UserAddress> {
    const item = await this.findMineOne(userId, id);
    if (dto.isDefault && !item.isDefault) await this.clearDefault(userId);
    Object.assign(item, {
      ...dto,
      comment: dto.comment ?? null,
      isDefault: dto.isDefault || item.isDefault,
    });
    return this.addresses.save(item);
  }

  async remove(userId: string, id: string): Promise<void> {
    const item = await this.findMineOne(userId, id);
    await this.addresses.remove(item);
    // Если удалили адрес по умолчанию — назначаем самый старый из оставшихся.
    if (item.isDefault) {
      const next = await this.addresses.findOne({ where: { userId }, order: { createdAt: 'ASC' } });
      if (next) {
        next.isDefault = true;
        await this.addresses.save(next);
      }
    }
  }

  private async findMineOne(userId: string, id: string): Promise<UserAddress> {
    const item = await this.addresses.findOne({ where: { id, userId } });
    if (!item) {
      throw new NotFoundException('Адрес не найден');
    }
    return item;
  }

  private async clearDefault(userId: string): Promise<void> {
    await this.addresses.update({ userId, isDefault: true }, { isDefault: false });
  }
}
