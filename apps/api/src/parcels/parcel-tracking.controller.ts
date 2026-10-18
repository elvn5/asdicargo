import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ParcelsService, type PublicTracking } from './parcels.service';

/**
 * Публичное отслеживание по трек-номеру (виджет «Отследите груз» на сайте).
 * Отдаём только статус и историю — без описания, веса, стоимости и владельца.
 */
@Controller('parcels/track')
export class ParcelTrackingController {
  constructor(private readonly service: ParcelsService) {}

  @Get(':trackNumber')
  async track(@Param('trackNumber') trackNumber: string): Promise<PublicTracking> {
    const normalized = trackNumber.trim();
    if (!normalized || normalized.length > 64) {
      throw new NotFoundException('Посылка не найдена');
    }
    const result = await this.service.findPublicTracking(normalized);
    if (!result) {
      throw new NotFoundException('Посылка не найдена');
    }
    return result;
  }
}
