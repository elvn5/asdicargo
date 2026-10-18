import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AsDi Cargo не принимает посылки и не держит пункты выдачи: вместо этих услуг
 * на странице «Услуги» — складирование грузов и подготовка документов. Меняем
 * только исходные формулировки (если текст правили в админке — не трогаем).
 */
const REPLACEMENTS: Array<{ language: 'ru' | 'ky' | 'en'; from: string; to: string }> = [
  // ru
  {
    language: 'ru',
    from: 'AsDi Cargo принимает, перевозит и выдаёт ваши грузы и посылки.',
    to: 'AsDi Cargo хранит и перевозит ваши грузы, а также готовит все документы для перевозки.',
  },
  {
    language: 'ru',
    from: '<h3>Приём посылок</h3><p>Персональный адрес на складе — оформляйте покупки в зарубежных магазинах и получайте их у нас.</p>',
    to: '<h3>Складирование грузов</h3><p>Принимаем и храним ваш груз на складе — до отправки или после прибытия, в сохранности и под контролем.</p>',
  },
  {
    language: 'ru',
    from: '<h3>Пункты выдачи</h3><p>Удобные адреса для получения — выбирайте ближайший к вам.</p>',
    to: '<h3>Подготовка документов</h3><p>Готовим все документы, необходимые для грузоперевозки, — вам не нужно разбираться в бумагах.</p>',
  },
  // ky
  {
    language: 'ky',
    from: 'AsDi Cargo сиздин жүктөрүңүздү жана посылкаларыңызды кабыл алат, ташыйт жана берет.',
    to: 'AsDi Cargo жүктөрүңүздү сактайт жана ташыйт, ошондой эле ташуу үчүн бардык документтерди даярдайт.',
  },
  {
    language: 'ky',
    from: '<h3>Посылкаларды кабыл алуу</h3><p>Кампадагы жеке дарек — чет элдик дүкөндөрдөн буйрутма бериңиз да, бизден алыңыз.</p>',
    to: '<h3>Жүктөрдү сактоо</h3><p>Жүгүңүздү кампага кабыл алып сактайбыз — жөнөтүүгө чейин же келгенден кийин, коопсуз жана көзөмөлдө.</p>',
  },
  {
    language: 'ky',
    from: '<h3>Берүү пункттары</h3><p>Ыңгайлуу даректер — өзүңүзгө жакынын тандаңыз.</p>',
    to: '<h3>Документтерди даярдоо</h3><p>Жүк ташуу үчүн керектүү бардык документтерди даярдайбыз — кагаздар менен убара болбойсуз.</p>',
  },
  // en
  {
    language: 'en',
    from: 'AsDi Cargo receives, ships and hands over your cargo and parcels.',
    to: 'AsDi Cargo stores and ships your cargo and prepares all the paperwork for the transport.',
  },
  {
    language: 'en',
    from: '<h3>Parcel receiving</h3><p>A personal warehouse address — shop in foreign stores and pick up your orders with us.</p>',
    to: '<h3>Cargo storage</h3><p>We receive and store your cargo at our warehouse — before dispatch or after arrival, safe and under control.</p>',
  },
  {
    language: 'en',
    from: '<h3>Pickup points</h3><p>Convenient pickup addresses — choose the one nearest to you.</p>',
    to: '<h3>Document preparation</h3><p>We prepare all the documents required for your shipment — no need to deal with the paperwork yourself.</p>',
  },
];

export class ServicesStorageAndDocuments1790700000000 implements MigrationInterface {
  name = 'ServicesStorageAndDocuments1790700000000';

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
