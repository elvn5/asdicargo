import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  type CreateAddressDto,
  type UpdateAddressDto,
  createAddressSchema,
  updateAddressSchema,
} from './address.dto';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  // -------- Публичное: активные пункты для кабинета и сайта --------
  @Get('public')
  findPublic() {
    return this.service.findPublic();
  }

  // -------- Админ (JWT-кука) --------
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(new ZodValidationPipe(createAddressSchema)) dto: CreateAddressDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAddressSchema)) dto: UpdateAddressDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
