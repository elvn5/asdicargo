import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import type { Parcel } from '@app/database';
import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { type MyParcelsQuery, myParcelsQuerySchema } from './account-parcels.dto';
import { AccountParcelsService, type ParcelSummary } from './account-parcels.service';
import { CurrentUserId } from './current-user.decorator';
import { UserJwtAuthGuard } from './user-jwt-auth.guard';

@Controller('account/parcels')
@UseGuards(UserJwtAuthGuard)
export class AccountParcelsController {
  constructor(private readonly service: AccountParcelsService) {}

  @Get()
  findMine(
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(myParcelsQuerySchema)) query: MyParcelsQuery,
  ): Promise<Parcel[]> {
    return this.service.findMine(userId, query);
  }

  // Объявлен до ':id', чтобы 'summary' не перехватывался как id.
  @Get('summary')
  summary(@CurrentUserId() userId: string): Promise<ParcelSummary> {
    return this.service.summary(userId);
  }

  @Get(':id')
  findOne(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Parcel> {
    return this.service.findMineOne(userId, id);
  }
}
