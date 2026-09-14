import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { type UpdateHomeStatsDto, updateHomeStatsSchema } from './home-stats.dto';
import { HomeStatsService, type PublicHomeStat } from './home-stats.service';

@Controller('home-stats')
export class HomeStatsController {
  constructor(private readonly service: HomeStatsService) {}

  // -------- Публичное (без авторизации): для секции «в цифрах» --------
  @Get('public')
  getPublic(@Query('language') language?: string): Promise<PublicHomeStat[]> {
    return this.service.findPublic(language);
  }

  // -------- Админ (JWT-кука) --------
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll(@Query('language') language?: string) {
    return this.service.findAllAdmin(language);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  update(
    @Query('language') language: string,
    @Body(new ZodValidationPipe(updateHomeStatsSchema)) dto: UpdateHomeStatsDto,
  ) {
    return this.service.update(language, dto);
  }
}
