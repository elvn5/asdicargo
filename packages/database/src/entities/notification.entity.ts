import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  PARCEL_STATUS = 'parcel_status',
  REQUEST_STATUS = 'request_status',
  REQUEST_REPLY = 'request_reply',
  APPEAL_REPLY = 'appeal_reply',
  DOCUMENT_READY = 'document_ready',
  DOCUMENT_REJECTED = 'document_rejected',
}

/**
 * Уведомление в кабинете. Текст не хранится: клиент собирает его из type и
 * params через i18n — так уведомление отображается на языке интерфейса.
 */
@Entity('notifications')
@Index('IDX_notifications_userId_createdAt', ['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_notifications_userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  params!: Record<string, string | number>;

  // Путь в кабинете, напр. /account/parcels/<id>.
  @Column({ type: 'varchar', nullable: true })
  link!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
