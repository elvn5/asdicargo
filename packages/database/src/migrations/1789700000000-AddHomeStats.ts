import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Секция «AsDi Cargo в цифрах» на главной странице становится редактируемой
 * из админки. Таблица home_stats хранит ровно 4 позиции на каждый язык
 * интерфейса (ru/ky/en); засеваем текущими значениями из i18n.
 */
export class AddHomeStats1789700000000 implements MigrationInterface {
  name = 'AddHomeStats1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."home_stats_language_enum" AS ENUM('ru', 'ky', 'en')`);
    await queryRunner.query(
      `CREATE TABLE "home_stats" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "language" "public"."home_stats_language_enum" NOT NULL DEFAULT 'ru',
        "position" smallint NOT NULL,
        "value" character varying NOT NULL,
        "label" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_home_stats_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_home_stats_language_position" ON "home_stats" ("language", "position")`,
    );

    const seed: Array<{ language: 'ru' | 'ky' | 'en'; position: number; value: string; label: string }> = [
      // --- Русский ---
      { language: 'ru', position: 1, value: '2020', label: 'Год основания' },
      { language: 'ru', position: 2, value: '2', label: 'Страны — КР и РФ' },
      { language: 'ru', position: 3, value: '10 000+', label: 'Доставленных посылок' },
      { language: 'ru', position: 4, value: '99%', label: 'Положительных отзывов' },
      // --- Кыргызча ---
      { language: 'ky', position: 1, value: '2020', label: 'Негизделген жылы' },
      { language: 'ky', position: 2, value: '2', label: 'Өлкө — КР жана РФ' },
      { language: 'ky', position: 3, value: '10 000+', label: 'Жеткирилген посылкалар' },
      { language: 'ky', position: 4, value: '99%', label: 'Оң пикирлер' },
      // --- English ---
      { language: 'en', position: 1, value: '2020', label: 'Founded' },
      { language: 'en', position: 2, value: '2', label: 'Countries — KG & RU' },
      { language: 'en', position: 3, value: '10,000+', label: 'Parcels delivered' },
      { language: 'en', position: 4, value: '99%', label: 'Positive reviews' },
    ];

    for (const stat of seed) {
      await queryRunner.query(
        `INSERT INTO "home_stats" ("language", "position", "value", "label") VALUES ($1, $2, $3, $4)`,
        [stat.language, stat.position, stat.value, stat.label],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_home_stats_language_position"`);
    await queryRunner.query(`DROP TABLE "home_stats"`);
    await queryRunner.query(`DROP TYPE "public"."home_stats_language_enum"`);
  }
}
