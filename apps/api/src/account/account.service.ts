import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { User } from '@app/database';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import type { LoginDto, RegisterDto, TelegramLoginDto } from './account.dto';

// Публичное представление пользователя (без passwordHash).
export type PublicUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  telegramId: string | null;
  createdAt: Date;
};

const BCRYPT_ROUNDS = 12;
// Telegram-подпись считается устаревшей через 24 часа.
const TELEGRAM_AUTH_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: PublicUser; token: string }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким e-mail уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.users.create({
      email,
      passwordHash,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
    });
    const saved = await this.users.save(user);
    return { user: this.toPublic(saved), token: this.buildToken(saved) };
  }

  async login(dto: LoginDto): Promise<{ user: PublicUser; token: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверный e-mail или пароль');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Неверный e-mail или пароль');
    }

    return { user: this.toPublic(user), token: this.buildToken(user) };
  }

  async loginWithTelegram(dto: TelegramLoginDto): Promise<{ user: PublicUser; token: string }> {
    const botToken = this.configService.get<string>('BOT_TOKEN');
    if (!botToken) {
      throw new ServiceUnavailableException('Вход через Telegram не настроен');
    }

    this.verifyTelegramSignature(dto, botToken);

    const now = Math.floor(Date.now() / 1000);
    if (now - dto.auth_date > TELEGRAM_AUTH_TTL_SECONDS) {
      throw new UnauthorizedException('Данные Telegram устарели, попробуйте снова');
    }

    const telegramId = String(dto.id);
    let user = await this.users.findOne({ where: { telegramId } });
    if (!user) {
      user = this.users.create({ telegramId });
    }
    user.firstName = dto.first_name ?? user.firstName;
    user.lastName = dto.last_name ?? user.lastName;
    user.username = dto.username ?? user.username;
    user.avatarUrl = dto.photo_url ?? user.avatarUrl;
    const saved = await this.users.save(user);

    return { user: this.toPublic(saved), token: this.buildToken(saved) };
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return this.toPublic(user);
  }

  private buildToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, role: 'user' },
      { expiresIn: this.configService.get<string>('USER_JWT_EXPIRES_IN', '30d') },
    );
  }

  private verifyTelegramSignature(dto: TelegramLoginDto, botToken: string): void {
    const { hash, ...fields } = dto;
    const dataCheckString = Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    const secretKey = createHash('sha256').update(botToken).digest();
    const computed = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const computedBuf = Buffer.from(computed, 'hex');
    const providedBuf = Buffer.from(hash, 'hex');
    if (
      computedBuf.length !== providedBuf.length ||
      !timingSafeEqual(computedBuf, providedBuf)
    ) {
      throw new UnauthorizedException('Не удалось проверить данные Telegram');
    }
  }

  private toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      telegramId: user.telegramId,
      createdAt: user.createdAt,
    };
  }
}
