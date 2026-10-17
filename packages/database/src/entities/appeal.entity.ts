import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { AppealMessage } from './appeal-message.entity';
import { Parcel } from './parcel.entity';
import { User } from './user.entity';

export enum AppealCategory {
  DAMAGE = 'damage',
  LOSS = 'loss',
  DELAY = 'delay',
  PAYMENT = 'payment',
  OTHER = 'other',
}

export enum AppealStatus {
  // Ждёт ответа менеджера.
  OPEN = 'open',
  // Менеджер ответил, ждём клиента.
  ANSWERED = 'answered',
  CLOSED = 'closed',
}

/** Обращение/претензия клиента — переписка с менеджером, опционально по посылке. */
@Entity('appeals')
export class Appeal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('UQ_appeals_number', { unique: true })
  @Column({ type: 'int' })
  @Generated('increment')
  number!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_appeals_userId' })
  user!: User;

  @Index('IDX_appeals_userId')
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => Parcel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parcelId', foreignKeyConstraintName: 'FK_appeals_parcelId' })
  parcel!: Parcel | null;

  @Column({ type: 'uuid', nullable: true })
  parcelId!: string | null;

  @Column({ type: 'enum', enum: AppealCategory })
  category!: AppealCategory;

  @Column({ type: 'varchar' })
  subject!: string;

  @Column({ type: 'enum', enum: AppealStatus, default: AppealStatus.OPEN })
  status!: AppealStatus;

  @OneToMany('AppealMessage', 'appeal')
  messages!: AppealMessage[];

  // Время последнего сообщения — для сортировки списков.
  @Column({ type: 'timestamp', default: () => 'now()' })
  lastMessageAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
