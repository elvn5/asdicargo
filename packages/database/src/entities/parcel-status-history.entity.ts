import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Parcel, ParcelStatus } from './parcel.entity';

/**
 * История смены статусов посылки. Запись добавляется при создании посылки
 * и при каждом изменении статуса из админки — клиент видит её как таймлайн.
 */
@Entity('parcel_status_history')
export class ParcelStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(
    () => Parcel,
    (parcel) => parcel.history,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'parcelId', foreignKeyConstraintName: 'FK_parcel_status_history_parcelId' })
  parcel!: Parcel;

  @Index('IDX_parcel_status_history_parcelId')
  @Column({ type: 'uuid' })
  parcelId!: string;

  @Column({ type: 'enum', enum: ParcelStatus, enumName: 'parcels_status_enum' })
  status!: ParcelStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
