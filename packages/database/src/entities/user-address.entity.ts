import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/** Адресная книга клиента: сохранённые получатели/отправители для заявок. */
@Entity('user_addresses')
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_user_addresses_userId' })
  user!: User;

  @Index('IDX_user_addresses_userId')
  @Column({ type: 'uuid' })
  userId!: string;

  // Короткое название, напр. «Дом», «Склад в Москве».
  @Column({ type: 'varchar' })
  label!: string;

  @Column({ type: 'varchar' })
  contactName!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar' })
  city!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
