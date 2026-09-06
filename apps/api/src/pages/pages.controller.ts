import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { type UpdateSitePageDto, updateSitePageSchema } from './page.dto';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly service: PagesService) {}

  // -------- Публичное (без авторизации, только опубликованные) --------

  @Get('slug/:slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.service.findPublishedBySlug(slug);
  }

  // -------- Админ (JWT-кука) --------

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get('admin/:slug')
  @UseGuards(JwtAuthGuard)
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(updateSitePageSchema)) dto: UpdateSitePageDto,
  ) {
    return this.service.update(slug, dto);
  }
}
