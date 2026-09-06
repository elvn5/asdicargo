import { SitePage } from '@app/database';
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

  // ---- Публичное (только опубликованные) ----

  async findPublishedBySlug(slug: string): Promise<SitePage> {
    const page = await this.repository.findOne({ where: { slug, published: true } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  // ---- Админ ----

  findAll(): Promise<SitePage[]> {
    return this.repository.find({ order: { title: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<SitePage> {
    const page = await this.repository.findOne({ where: { slug } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  async update(slug: string, dto: UpdateSitePageDto): Promise<SitePage> {
    let page = await this.repository.findOne({ where: { slug } });
    if (!page) {
      // Слаги засеваются миграцией, но на случай отсутствия — создаём.
      page = this.repository.create({ slug, title: slug, content: '', published: true });
    }

    if (dto.title !== undefined) page.title = dto.title;
    if (dto.content !== undefined) page.content = sanitizeHtml(dto.content, SANITIZE_OPTIONS);
    if (dto.published !== undefined) page.published = dto.published;

    return this.repository.save(page);
  }
}
