import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Виджета «Отследите груз» на главной больше нет — в FAQ отправляем в личный
 * кабинет. Меняем только исходную формулировку (правки из админки не трогаем).
 */
const REPLACEMENTS: Array<{ language: 'ru' | 'ky' | 'en'; from: string; to: string }> = [
  {
    language: 'ru',
    from: 'Введите трек-номер в блоке «Отследите груз» на главной странице или откройте посылку в личном кабинете — там же приходят уведомления о смене статуса.',
    to: 'Откройте посылку в личном кабинете — там виден её текущий статус, а при его смене приходят уведомления.',
  },
  {
    language: 'ky',
    from: 'Башкы беттеги «Жүктү көзөмөлдөө» блогуна трек-номерди киргизиңиз же посылканы жеке кабинетте ачыңыз — абалы өзгөргөндө ошол жерге билдирме келет.',
    to: 'Посылканы жеке кабинетте ачыңыз — анын учурдагы абалы ошол жерде көрүнөт, ал эми абалы өзгөргөндө билдирме келет.',
  },
  {
    language: 'en',
    from: 'Enter your tracking number in the “Track your cargo” block on the home page or open the parcel in your account — you also get notifications when the status changes.',
    to: 'Open the parcel in your account — its current status is shown there, and you get notifications when it changes.',
  },
];

export class RemoveTrackingWidgetFromFaq1790810000000 implements MigrationInterface {
  name = 'RemoveTrackingWidgetFromFaq1790810000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const r of REPLACEMENTS) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = replace("content", $1, $2)
         WHERE "slug" = 'cargo-faq' AND "language" = $3 AND position($1 in "content") > 0`,
        [r.from, r.to, r.language],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const r of REPLACEMENTS) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = replace("content", $2, $1)
         WHERE "slug" = 'cargo-faq' AND "language" = $3 AND position($2 in "content") > 0`,
        [r.from, r.to, r.language],
      );
    }
  }
}
