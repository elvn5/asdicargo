import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Переносим на прод список направлений, который составили в админке staging
 * (4 маршрута, включая Казахстан), и приводим к нему ky/en. Меняем текст только
 * там, где он ещё исходный (не правился в админке).
 */
const PAGES: Array<{ language: 'ru' | 'ky' | 'en'; from: string; to: string }> = [
  {
    language: 'ru',
    from: '<h2>Направления доставки</h2><p>Мы возим грузы по двум основным маршрутам.</p><h3>Россия → Кыргызстан</h3><p>Доставка посылок и грузов из России в Кыргызстан.</p><h3>Кыргызстан → Россия</h3><p>Отправка грузов из Кыргызстана в Россию.</p>',
    to: '<p>Направления </p><p>* Бишкек → Россия</p><p>* Бишкек → Казахстан</p><p>* Россия → Кыргызстан</p><p>* Казахстан → Кыргызстан</p>',
  },
  {
    language: 'ky',
    from: '<h2>Жеткирүү багыттары</h2><p>Биз жүктөрдү эки негизги багыт боюнча ташыйбыз.</p><h3>Россия → Кыргызстан</h3><p>Россиядан Кыргызстанга посылкаларды жана жүктөрдү жеткирүү.</p><h3>Кыргызстан → Россия</h3><p>Кыргызстандан Россияга жүк жөнөтүү.</p>',
    to: '<p>Багыттар</p><p>* Бишкек → Россия</p><p>* Бишкек → Казакстан</p><p>* Россия → Кыргызстан</p><p>* Казакстан → Кыргызстан</p>',
  },
  {
    language: 'en',
    from: '<h2>Delivery directions</h2><p>We carry cargo along two main routes.</p><h3>Russia → Kyrgyzstan</h3><p>Delivery of parcels and cargo from Russia to Kyrgyzstan.</p><h3>Kyrgyzstan → Russia</h3><p>Shipping cargo from Kyrgyzstan to Russia.</p>',
    to: '<p>Directions</p><p>* Bishkek → Russia</p><p>* Bishkek → Kazakhstan</p><p>* Russia → Kyrgyzstan</p><p>* Kazakhstan → Kyrgyzstan</p>',
  },
];

export class UpdateDirectionsList1790600000000 implements MigrationInterface {
  name = 'UpdateDirectionsList1790600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const p of PAGES) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = $1
         WHERE "slug" = 'cargo-napravleniya' AND "language" = $2 AND "content" = $3`,
        [p.to, p.language, p.from],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const p of PAGES) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = $1
         WHERE "slug" = 'cargo-napravleniya' AND "language" = $2 AND "content" = $3`,
        [p.from, p.language, p.to],
      );
    }
  }
}
