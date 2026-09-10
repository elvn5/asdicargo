import { AuthModule } from '@/auth/auth.module';
import { User } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { UserJwtAuthGuard } from './user-jwt-auth.guard';

@Module({
  // AuthModule реэкспортирует JwtModule (тот же JWT_SECRET).
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [AccountController],
  providers: [AccountService, UserJwtAuthGuard],
  exports: [AccountService, UserJwtAuthGuard],
})
export class AccountModule {}
