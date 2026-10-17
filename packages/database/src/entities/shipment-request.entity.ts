import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Parcel } from './parcel.entity';
import { User } from './user.entity';

export enum ShipmentDirection {
  KG_RU = 'kg_ru',
  RU_KG = 'ru_kg',
}

export enum ShipmentRequestStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/**
 * Заявка клиента на перевозку из личного кабинета. Менеджер обрабатывает её
 * в админке и при приёме груза превращает в посылку (parcelId).
 */
@Entity('shipment_requests')
export class ShipmentRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Человекочитаемый номер заявки («№ 1024»).
  @Index('UQ_shipment_requests_number', { unique: true })
  @Column({ type: 'int' })
  @Generated('increment')
  number!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_shipment_requests_userId' })
  user!: User;

  @Index('IDX_shipment_requests_userId')
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: ShipmentDirection })
  direction!: ShipmentDirection;

  @Column({ type: 'varchar' })
  fromCity!: string;

  @Column({ type: 'varchar' })
  toCity!: string;

  @Column({ type: 'text' })
  cargoDescription!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  weightKg!: string;

  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  volumeM3!: string | null;

  // Предварительная стоимость по тарифам на момент создания заявки.
  @Column({ type: 'int' })
  estimatedCostSom!: number;

  @Column({ type: 'boolean', default: false })
  pickupRequired!: boolean;

  @Column({ type: 'text', nullable: true })
  pickupAddress!: string | null;

  @Column({ type: 'varchar' })
  recipientName!: string;

  @Column({ type: 'varchar' })
  recipientPhone!: string;

  @Column({ type: 'text' })
  recipientAddress!: string;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'enum', enum: ShipmentRequestStatus, default: ShipmentRequestStatus.NEW })
  status!: ShipmentRequestStatus;

  // Ответ менеджера — виден клиенту.
  @Column({ type: 'text', nullable: true })
  managerComment!: string | null;

  @ManyToOne(() => Parcel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parcelId', foreignKeyConstraintName: 'FK_shipment_requests_parcelId' })
  parcel!: Parcel | null;

  @Column({ type: 'uuid', nullable: true })
  parcelId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
