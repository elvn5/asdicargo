import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Тип точки: склад приёма, пункт выдачи или офис. */
export enum AddressKind {
  WAREHOUSE = 'warehouse',
  PICKUP = 'pickup',
  OFFICE = 'office',
}

/**
 * Адреса компании (склады, пункты выдачи, офисы). Редактируются в админке,
 * активные показываются клиентам в кабинете — списком и на карте.
 */
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'enum', enum: AddressKind, default: AddressKind.PICKUP })
  kind!: AddressKind;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  @Column({ type: 'text' })
  fullAddress!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  // Свободный текст, напр. «Пн–Пт 9:00–18:00, Сб 10:00–15:00».
  @Column({ type: 'varchar', nullable: true })
  workingHours!: string | null;

  // Координаты для карты; без них точка показывается только в списке.
  @Column({ type: 'double precision', nullable: true })
  latitude!: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude!: number | null;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
