import { AccountModule } from '@/account/account.module';
import { AuthModule } from '@/auth/auth.module';
import { ParcelsModule } from '@/parcels/parcels.module';
import { ShipmentRequest } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRequestsController, AdminRequestsController } from './shipment-requests.controller';
import { ShipmentRequestsService } from './shipment-requests.service';

@Module({
  // AccountModule — UserJwtAuthGuard, AuthModule — JwtAuthGuard, ParcelsModule — создание посылки.
  imports: [TypeOrmModule.forFeature([ShipmentRequest]), AccountModule, AuthModule, ParcelsModule],
  controllers: [AccountRequestsController, AdminRequestsController],
  providers: [ShipmentRequestsService],
})
export class ShipmentRequestsModule {}
