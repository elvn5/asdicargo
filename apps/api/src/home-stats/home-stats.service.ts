import { HomeStat, PageLanguage } from '@app/database';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { UpdateHomeStatsDto } from './home-stats.dto';

export interface PublicHomeStat {
  value: string;
  label: string;
}

const POSITIONS = [1, 2, 3, 4] as const;

@Injectable()
export class HomeStatsService {
  constructor(
    @InjectRepository(HomeStat)
    private readonly repository: Repository<HomeStat>,
  ) {}

  private normalizeLanguage(language?: string): PageLanguage {
    if (language === PageLanguage.EN) return PageLanguage.EN;
    if (language === PageLanguage.KY) return PageLanguage.KY;
    return PageLanguage.RU;
  }

  // ---- Публичное: 4 плашки для главной страницы ----

  async findPublic(language?: string): Promise<PublicHomeStat[]> {
    const lang = this.normalizeLanguage(language);
    let rows = await this.repository.find({
      where: { language: lang },
      order: { position: 'ASC' },
    });
    // Откат на русский, если для локали ещё нет значений.
    if (rows.length === 0 && lang !== PageLanguage.RU) {
      rows = await this.repository.find({
        where: { language: PageLanguage.RU },
        order: { position: 'ASC' },
      });
    }
    return rows.map((r) => ({ value: r.value, label: r.label }));
  }

  // ---- Админ ----

  async findAllAdmin(language?: string): Promise<HomeStat[]> {
    const lang = this.normalizeLanguage(language);
    const existing = await this.repository.find({
      where: { language: lang },
      order: { position: 'ASC' },
    });
    const byPosition = new Map(existing.map((r) => [r.position, r]));

    // Позиции без перевода отдаём как редактируемую заготовку на основе русской строки.
    const ru =
      lang === PageLanguage.RU
        ? existing
        : await this.repository.find({ where: { language: PageLanguage.RU } });
    const ruByPosition = new Map(ru.map((r) => [r.position, r]));

    return POSITIONS.map(
      (position) =>
        byPosition.get(position) ??
        this.repository.create({
          language: lang,
          position,
          value: ruByPosition.get(position)?.value ?? '',
          label: ruByPosition.get(position)?.label ?? '',
        }),
    );
  }

  async update(language: string, dto: UpdateHomeStatsDto): Promise<HomeStat[]> {
    const lang = this.normalizeLanguage(language);
    const saved: HomeStat[] = [];
    for (const item of dto.items) {
      let row = await this.repository.findOne({
        where: { language: lang, position: item.position },
      });
      if (!row) {
        row = this.repository.create({ language: lang, position: item.position });
      }
      row.value = item.value;
      row.label = item.label;
      saved.push(await this.repository.save(row));
    }
    return saved.sort((a, b) => a.position - b.position);
  }
}
