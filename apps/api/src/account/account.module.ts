import { AuthModule } from '@/auth/auth.module';
import { Parcel, User, UserAddress } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountAddressesController } from './account-addresses.controller';
import { AccountAddressesService } from './account-addresses.service';
import { AccountParcelsController } from './account-parcels.controller';
import { AccountParcelsService } from './account-parcels.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UserJwtAuthGuard } from './user-jwt-auth.guard';

@Module({
  // AuthModule реэкспортирует JwtModule (тот же JWT_SECRET).
  imports: [TypeOrmModule.forFeature([User, Parcel, UserAddress]), AuthModule],
  controllers: [AccountController, AccountParcelsController, AccountAddressesController],
  providers: [AccountService, AccountParcelsService, AccountAddressesService, UserJwtAuthGuard],
  exports: [AccountService, UserJwtAuthGuard],
})
export class AccountModule {}
