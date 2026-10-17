import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PageLanguage } from './site-page.entity';

/**
 * Показатель секции «AsDi Cargo в цифрах» на главной странице, редактируемый
 * из админки. Ровно 4 позиции (position 1..4) на каждый язык интерфейса;
 * уникальна пара (language, position). Значение (value) хранится строкой —
 * оно может содержать суффикс («10 000+», «99%») — числовая часть анимируется
 * на клиенте при появлении блока во вьюпорте.
 */
@Entity('home_stats')
@Index('UQ_home_stats_language_position', ['language', 'position'], { unique: true })
export class HomeStat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: PageLanguage, default: PageLanguage.RU })
  language!: PageLanguage;

  /** Порядковый номер плашки на главной (1..4). */
  @Column({ type: 'smallint' })
  position!: number;

  @Column({ type: 'varchar' })
  value!: string;

  @Column({ type: 'varchar' })
  label!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
