import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { type UpdateSupportInfoDto, updateSupportInfoSchema } from './support.dto';
import { type PublicSettings, SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  // -------- Публичное (без авторизации): настройки для сайта --------
  @Get('public')
  getPublic(): Promise<PublicSettings> {
    return this.service.getPublic();
  }

  // -------- Админ (JWT-кука) --------
  @Get()
  @UseGuards(JwtAuthGuard)
  get() {
    return this.service.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  update(@Body(new ZodValidationPipe(updateSupportInfoSchema)) dto: UpdateSupportInfoDto) {
    return this.service.update(dto);
  }
}
