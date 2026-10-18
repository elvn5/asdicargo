import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Parcel } from './parcel.entity';

/**
 * Способ, которым пользователь завёл аккаунт / вошёл в последний раз.
 * telegram — через бывшего бота или Telegram Login Widget (вход сейчас отключён);
 * email — регистрация по e-mail и паролю.
 */
export type AuthProvider = 'telegram' | 'email';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // telegramId больше не обязателен: пользователи сайта могут регистрироваться
  // по e-mail без привязки Telegram.
  @Index('UQ_users_telegramId', { unique: true, where: '"telegramId" IS NOT NULL' })
  @Column({ type: 'bigint', nullable: true })
  telegramId!: string | null;

  // E-mail для регистрации/входа по паролю. Уникален среди заполненных.
  @Index('UQ_users_email', { unique: true, where: '"email" IS NOT NULL' })
  @Column({ type: 'varchar', nullable: true })
  email!: string | null;

  // Хэш пароля (bcrypt). null — если пользователь входит только через провайдера.
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash!: string | null;

  // URL аватара (из Telegram), если есть.
  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  username!: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @OneToMany(
    () => Parcel,
    (parcel) => parcel.user,
  )
  parcels!: Parcel[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
