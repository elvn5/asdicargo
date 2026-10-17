import { AccountModule } from '@/account/account.module';
import { AuthModule } from '@/auth/auth.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { Appeal, AppealMessage, Parcel } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountAppealsController, AdminAppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appeal, AppealMessage, Parcel]),
    AccountModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AccountAppealsController, AdminAppealsController],
  providers: [AppealsService],
})
export class AppealsModule {}
