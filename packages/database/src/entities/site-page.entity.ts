import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Язык контентной страницы. Совпадает с локалями клиента (i18n). */
export enum PageLanguage {
  RU = 'ru',
  KY = 'ky',
  EN = 'en',
}

/**
 * Контентная страница сайта, редактируемая из админки (Услуги, Контакты,
 * Направления, Документы, Вопрос-Ответ, О нас и т.п.). Набор слагов фиксирован
 * и засевается миграцией; админ правит title/content/published отдельно для
 * каждого языка. Уникальна пара (slug, language) — на каждый слаг по строке на
 * язык; клиент запрашивает контент по текущей локали с откатом на русский.
 */
@Entity('site_pages')
@Index(['slug', 'language'], { unique: true })
export class SitePage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Семантический слаг маршрута на клиенте, напр. "cargo-uslugi". */
  @Index()
  @Column({ type: 'varchar' })
  slug!: string;

  /** Язык контента строки. */
  @Column({ type: 'enum', enum: PageLanguage, default: PageLanguage.RU })
  language!: PageLanguage;

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
