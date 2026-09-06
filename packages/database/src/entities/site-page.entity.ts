import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Контентная страница сайта, редактируемая из админки (Услуги, Контакты,
 * Направления, Документы, Вопрос-Ответ и т.п.). Набор слагов фиксирован и
 * засевается миграцией; админ правит title/content/published.
 */
@Entity('site_pages')
export class SitePage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Семантический слаг маршрута на клиенте, напр. "cargo-uslugi". */
  @Index({ unique: true })
  @Column({ type: 'varchar' })
  slug!: string;

  @Column({ type: 'varchar' })
  title!: string;

  /** Санитизированный HTML из TipTap (семантические теги). */
  @Column({ type: 'text', default: '' })
  content!: string;

  @Column({ type: 'boolean', default: true })
  published!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
