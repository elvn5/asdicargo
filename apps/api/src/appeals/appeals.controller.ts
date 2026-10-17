import { CurrentUserId } from '@/account/current-user.decorator';
import { UserJwtAuthGuard } from '@/account/user-jwt-auth.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import type { Appeal } from '@app/database';
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
  type AdminAppealsQuery,
  type AppealMessageDto,
  type CreateAppealDto,
  type UpdateAppealDto,
  adminAppealsQuerySchema,
  appealMessageSchema,
  createAppealSchema,
  updateAppealSchema,
} from './appeal.dto';
import { AppealsService } from './appeals.service';

/** Обращения текущего пользователя сайта. */
@Controller('account/appeals')
@UseGuards(UserJwtAuthGuard)
export class AccountAppealsController {
  constructor(private readonly service: AppealsService) {}

  @Get()
  findMine(@CurrentUserId() userId: string): Promise<Appeal[]> {
    return this.service.findMine(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Appeal> {
    return this.service.findMineOne(userId, id);
  }

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(createAppealSchema)) dto: CreateAppealDto,
  ): Promise<Appeal> {
    return this.service.create(userId, dto);
  }

  @Post(':id/messages')
  reply(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(appealMessageSchema)) dto: AppealMessageDto,
  ): Promise<Appeal> {
    return this.service.replyAsClient(userId, id, dto);
  }

  @Post(':id/close')
  @HttpCode(200)
  close(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string): Promise<Appeal> {
    return this.service.closeMine(userId, id);
  }
}

/** Работа менеджера с обращениями в админке. */
@Controller('appeals')
@UseGuards(JwtAuthGuard)
export class AdminAppealsController {
  constructor(private readonly service: AppealsService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(adminAppealsQuerySchema)) query: AdminAppealsQuery,
  ): Promise<Appeal[]> {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Appeal> {
    return this.service.findOne(id);
  }

  @Post(':id/messages')
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(appealMessageSchema)) dto: AppealMessageDto,
  ): Promise<Appeal> {
    return this.service.replyAsManager(id, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAppealSchema)) dto: UpdateAppealDto,
  ): Promise<Appeal> {
    return this.service.update(id, dto);
  }
}
