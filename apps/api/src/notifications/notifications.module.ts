import { AccountModule } from '@/account/account.module';
import { AuthModule } from '@/auth/auth.module';
import { Notification } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  // AccountModule — UserJwtAuthGuard, AuthModule — JwtService для него.
  imports: [TypeOrmModule.forFeature([Notification]), AccountModule, AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
