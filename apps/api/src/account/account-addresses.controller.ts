import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import type { UserAddress } from '@app/database';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { type UserAddressDto, userAddressSchema } from './account-addresses.dto';
import { AccountAddressesService } from './account-addresses.service';
import { CurrentUserId } from './current-user.decorator';
import { UserJwtAuthGuard } from './user-jwt-auth.guard';

@Controller('account/addresses')
@UseGuards(UserJwtAuthGuard)
export class AccountAddressesController {
  constructor(private readonly service: AccountAddressesService) {}

  @Get()
  findMine(@CurrentUserId() userId: string): Promise<UserAddress[]> {
    return this.service.findMine(userId);
  }

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(userAddressSchema)) dto: UserAddressDto,
  ): Promise<UserAddress> {
    return this.service.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(userAddressSchema)) dto: UserAddressDto,
  ): Promise<UserAddress> {
    return this.service.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUserId() userId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(userId, id);
  }
}
