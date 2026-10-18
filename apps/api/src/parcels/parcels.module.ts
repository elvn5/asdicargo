import { AuthModule } from '@/auth/auth.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { Parcel, ParcelStatusHistory } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelTrackingController } from './parcel-tracking.controller';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parcel, ParcelStatusHistory]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [ParcelTrackingController, ParcelsController],
  providers: [ParcelsService],
  exports: [ParcelsService],
})
export class ParcelsModule {}
