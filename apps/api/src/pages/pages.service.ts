import { PageLanguage, SitePage } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import sanitizeHtml from 'sanitize-html';
import type { Repository } from 'typeorm';
import type { UpdateSitePageDto } from './page.dto';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'strong',
    'em',
    's',
    'u',
    'code',
    'pre',
    'br',
    'hr',
    'img',
    'figure',
    'figcaption',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    span: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(SitePage)
    private readonly repository: Repository<SitePage>,
  ) {}

  /** Нормализует произвольную строку языка к enum; по умолчанию русский. */
  private normalizeLanguage(language?: string): PageLanguage {
    if (language === PageLanguage.EN) return PageLanguage.EN;
    if (language === PageLanguage.KY) return PageLanguage.KY;
    return PageLanguage.RU;
  }

  // ---- Публичное (только опубликованные) ----

  async findPublishedBySlug(slug: string, language?: string): Promise<SitePage> {
    const lang = this.normalizeLanguage(language);
    let page = await this.repository.findOne({ where: { slug, language: lang, published: true } });
    // Откат на русский, если для локали нет опубликованного перевода.
    if (!page && lang !== PageLanguage.RU) {
      page = await this.repository.findOne({
        where: { slug, language: PageLanguage.RU, published: true },
      });
    }
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  // ---- Админ ----

  /** Список: по одной строке на слаг (русская — каноничная). */
  findAll(): Promise<SitePage[]> {
    return this.repository.find({
      where: { language: PageLanguage.RU },
      order: { title: 'ASC' },
    });
  }

  async findBySlug(slug: string, language?: string): Promise<SitePage> {
    const lang = this.normalizeLanguage(language);
    const page = await this.repository.findOne({ where: { slug, language: lang } });
    if (page) return page;

    // Перевода ещё нет — отдаём редактируемую заготовку на основе русской строки,
    // чтобы админ мог её создать. Не сохраняется до явного сохранения.
    const ru = await this.repository.findOne({ where: { slug, language: PageLanguage.RU } });
    if (!ru) {
      throw new NotFoundException('Page not found');
    }
    return this.repository.create({
      slug,
      language: lang,
      title: ru.title,
      content: '',
      published: true,
    });
  }

  async update(slug: string, language: string, dto: UpdateSitePageDto): Promise<SitePage> {
    const lang = this.normalizeLanguage(language);
    let page = await this.repository.findOne({ where: { slug, language: lang } });
    if (!page) {
      // Слаги засеваются миграцией, но на случай отсутствия перевода — создаём.
      page = this.repository.create({ slug, language: lang, title: slug, content: '', published: true });
    }

    if (dto.title !== undefined) page.title = dto.title;
    if (dto.content !== undefined) page.content = sanitizeHtml(dto.content, SANITIZE_OPTIONS);
    if (dto.published !== undefined) page.published = dto.published;

    return this.repository.save(page);
  }
}
