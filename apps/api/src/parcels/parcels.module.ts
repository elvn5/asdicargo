import { AuthModule } from '@/auth/auth.module';
import { Parcel, ParcelStatusHistory } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Parcel, ParcelStatusHistory]), AuthModule],
  controllers: [ParcelsController],
  providers: [ParcelsService],
  exports: [ParcelsService],
})
export class ParcelsModule {}
