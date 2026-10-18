import { User } from '@app/database';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import type { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './account.dto';

// Публичное представление пользователя (без passwordHash).
export type PublicUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  phone: string | null;
  // Задан ли пароль: кабинет спрашивает текущий пароль только в этом случае.
  hasPassword: boolean;
  createdAt: Date;
};

const BCRYPT_ROUNDS = 12;

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

  async getProfile(userId: string): Promise<PublicUser> {
    return this.toPublic(await this.findWithPassword(userId));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.findWithPassword(userId);

    if (dto.email !== user.email) {
      // Нельзя убрать e-mail, если по нему входят паролем, — иначе потеряется доступ.
      if (!dto.email && user.passwordHash) {
        throw new BadRequestException('E-mail нужен для входа в аккаунт');
      }
      if (dto.email) {
        const taken = await this.users.findOne({ where: { email: dto.email } });
        if (taken && taken.id !== user.id) {
          throw new ConflictException('Пользователь с таким e-mail уже существует');
        }
      }
    }

    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.phone = dto.phone;
    user.email = dto.email;
    return this.toPublic(await this.users.save(user));
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findWithPassword(userId);

    if (user.passwordHash) {
      const valid = await bcrypt.compare(dto.currentPassword ?? '', user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Текущий пароль указан неверно');
      }
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.users.save(user);
  }

  private async findWithPassword(userId: string): Promise<User> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :userId', { userId })
      .getOne();
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  private buildToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, role: 'user' },
      { expiresIn: this.configService.get<string>('USER_JWT_EXPIRES_IN', '30d') },
    );
  }

  private toPublic(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      hasPassword: Boolean(user.passwordHash),
      createdAt: user.createdAt,
    };
  }
}
