import { AuthModule } from '@/auth/auth.module';
import { HomeStat } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeStatsController } from './home-stats.controller';
import { HomeStatsService } from './home-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([HomeStat]), AuthModule],
  controllers: [HomeStatsController],
  providers: [HomeStatsService],
})
export class HomeStatsModule {}
