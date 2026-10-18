import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Во вступлении страницы «Услуги» осталась фраза про Telegram-бота, которого
 * больше нет. Меняем только эту фразу и только там, где текст не правили
 * в админке (ищем исходную формулировку целиком).
 */
const REPLACEMENTS: Array<{ language: 'ru' | 'ky' | 'en'; from: string; to: string }> = [
  {
    language: 'ru',
    from: 'Оформление и отслеживание — прямо в Telegram-боте.',
    to: 'Расчёт, оформление и отслеживание — на сайте и в личном кабинете.',
  },
  {
    language: 'ky',
    from: 'Таштоо жана көзөмөл — Telegram-ботто.',
    to: 'Эсептөө, тариздөө жана көзөмөл — сайтта жана жеке кабинетте.',
  },
  {
    language: 'en',
    from: 'Ordering and tracking happen right in the Telegram bot.',
    to: 'Cost estimates, booking and tracking happen right on the website and in your account.',
  },
];

export class UpdateServicesIntro1790300000000 implements MigrationInterface {
  name = 'UpdateServicesIntro1790300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const r of REPLACEMENTS) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = replace("content", $1, $2)
         WHERE "slug" = 'cargo-uslugi' AND "language" = $3 AND position($1 in "content") > 0`,
        [r.from, r.to, r.language],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const r of REPLACEMENTS) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = replace("content", $2, $1)
         WHERE "slug" = 'cargo-uslugi' AND "language" = $3 AND position($2 in "content") > 0`,
        [r.from, r.to, r.language],
      );
    }
  }
}
