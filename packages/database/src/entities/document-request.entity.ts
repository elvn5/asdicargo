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
import { User } from './user.entity';

export enum DocumentType {
  INVOICE = 'invoice',
  RECONCILIATION = 'reconciliation',
  OTHER = 'other',
}

export enum DocumentRequestStatus {
  PENDING = 'pending',
  READY = 'ready',
  REJECTED = 'rejected',
}

/**
 * Заказ документа клиентом (счёт, акт сверки). Менеджер прикладывает файл —
 * он хранится прямо в БД (bytea): документов немного, а так файлы переживают
 * пересборку контейнеров без отдельного хранилища.
 */
@Entity('document_requests')
export class DocumentRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('UQ_document_requests_number', { unique: true })
  @Column({ type: 'int' })
  @Generated('increment')
  number!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_document_requests_userId' })
  user!: User;

  @Index('IDX_document_requests_userId')
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: DocumentType })
  type!: DocumentType;

  @Column({ type: 'date', nullable: true })
  periodFrom!: string | null;

  @Column({ type: 'date', nullable: true })
  periodTo!: string | null;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'enum', enum: DocumentRequestStatus, default: DocumentRequestStatus.PENDING })
  status!: DocumentRequestStatus;

  @Column({ type: 'text', nullable: true })
  managerComment!: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileMime!: string | null;

  @Column({ type: 'int', nullable: true })
  fileSize!: number | null;

  // Содержимое файла не выбирается по умолчанию — только при скачивании.
  @Column({ type: 'bytea', nullable: true, select: false })
  fileData!: Buffer | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
