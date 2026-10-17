import { AuthModule } from '@/auth/auth.module';
import { Parcel, User } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountParcelsController } from './account-parcels.controller';
import { AccountParcelsService } from './account-parcels.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UserJwtAuthGuard } from './user-jwt-auth.guard';

@Module({
  // AuthModule реэкспортирует JwtModule (тот же JWT_SECRET).
  imports: [TypeOrmModule.forFeature([User, Parcel]), AuthModule],
  controllers: [AccountController, AccountParcelsController],
  providers: [AccountService, AccountParcelsService, UserJwtAuthGuard],
  exports: [AccountService, UserJwtAuthGuard],
})
export class AccountModule {}
