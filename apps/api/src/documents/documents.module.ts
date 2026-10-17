import { AccountModule } from '@/account/account.module';
import { AuthModule } from '@/auth/auth.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { DocumentRequest } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountDocumentsController, AdminDocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentRequest]),
    AccountModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AccountDocumentsController, AdminDocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
