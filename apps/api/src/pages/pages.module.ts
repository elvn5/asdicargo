import { AuthModule } from '@/auth/auth.module';
import { SitePage } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([SitePage]), AuthModule],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
