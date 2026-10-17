import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appeal } from './appeal.entity';

export enum AppealAuthor {
  CLIENT = 'client',
  MANAGER = 'manager',
}

@Entity('appeal_messages')
export class AppealMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(
    () => Appeal,
    (appeal) => appeal.messages,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'appealId', foreignKeyConstraintName: 'FK_appeal_messages_appealId' })
  appeal!: Appeal;

  @Index('IDX_appeal_messages_appealId')
  @Column({ type: 'uuid' })
  appealId!: string;

  @Column({ type: 'enum', enum: AppealAuthor })
  author!: AppealAuthor;

  @Column({ type: 'text' })
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
