import { CurrentUserId } from '@/account/current-user.decorator';
import { UserJwtAuthGuard } from '@/account/user-jwt-auth.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import type { ShipmentRequest } from '@app/database';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  type AdminRequestsQuery,
  type ConvertShipmentRequestDto,
  type CreateShipmentRequestDto,
  type UpdateShipmentRequestDto,
  adminRequestsQuerySchema,
  convertShipmentRequestSchema,
  createShipmentRequestSchema,
  updateShipmentRequestSchema,
} from './shipment-request.dto';
import { ShipmentRequestsService } from './shipment-requests.service';

/** Заявки текущего пользователя сайта. */
@Controller('account/requests')
@UseGuards(UserJwtAuthGuard)
export class AccountRequestsController {
  constructor(private readonly service: ShipmentRequestsService) {}

  @Get()
  findMine(@CurrentUserId() userId: string): Promise<ShipmentRequest[]> {
    return this.service.findMine(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShipmentRequest> {
    return this.service.findMineOne(userId, id);
  }

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(createShipmentRequestSchema)) dto: CreateShipmentRequestDto,
  ): Promise<ShipmentRequest> {
    return this.service.create(userId, dto);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShipmentRequest> {
    return this.service.cancelMine(userId, id);
  }
}

/** Обработка заявок менеджером в админке. */
@Controller('shipment-requests')
@UseGuards(JwtAuthGuard)
export class AdminRequestsController {
  constructor(private readonly service: ShipmentRequestsService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(adminRequestsQuerySchema)) query: AdminRequestsQuery,
  ): Promise<ShipmentRequest[]> {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShipmentRequest> {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateShipmentRequestSchema)) dto: UpdateShipmentRequestDto,
  ): Promise<ShipmentRequest> {
    return this.service.update(id, dto);
  }

  @Post(':id/convert')
  @HttpCode(200)
  convert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(convertShipmentRequestSchema)) dto: ConvertShipmentRequestDto,
  ): Promise<ShipmentRequest> {
    return this.service.convertToParcel(id, dto);
  }
}
