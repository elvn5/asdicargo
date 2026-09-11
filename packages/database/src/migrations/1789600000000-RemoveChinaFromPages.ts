import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AsDi Cargo возит только между Кыргызстаном и Россией — убираем упоминания
 * Китая из уже засеянного контента страниц «Направления» и «О нас» на всех
 * языках. UPDATE выполняется только для строк, где Китай ещё присутствует
 * (LIKE), чтобы не затирать правки, сделанные из админки.
 */
export class RemoveChinaFromPages1789600000000 implements MigrationInterface {
  name = 'RemoveChinaFromPages1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fixes: Array<{ slug: string; language: string; like: string; content: string }> = [
      // --- Направления (два маршрута вместо трёх) ---
      {
        slug: 'cargo-napravleniya',
        language: 'ru',
        like: '%Кита%',
        content:
          '<h2>Направления доставки</h2>' +
          '<p>Мы возим грузы по двум основным маршрутам.</p>' +
          '<h3>Россия → Кыргызстан</h3>' +
          '<p>Доставка посылок и грузов из России в Кыргызстан.</p>' +
          '<h3>Кыргызстан → Россия</h3>' +
          '<p>Отправка грузов из Кыргызстана в Россию.</p>',
      },
      {
        slug: 'cargo-napravleniya',
        language: 'en',
        like: '%China%',
        content:
          '<h2>Delivery directions</h2>' +
          '<p>We carry cargo along two main routes.</p>' +
          '<h3>Russia → Kyrgyzstan</h3>' +
          '<p>Delivery of parcels and cargo from Russia to Kyrgyzstan.</p>' +
          '<h3>Kyrgyzstan → Russia</h3>' +
          '<p>Shipping cargo from Kyrgyzstan to Russia.</p>',
      },
      {
        slug: 'cargo-napravleniya',
        language: 'ky',
        like: '%Кытай%',
        content:
          '<h2>Жеткирүү багыттары</h2>' +
          '<p>Биз жүктөрдү эки негизги багыт боюнча ташыйбыз.</p>' +
          '<h3>Россия → Кыргызстан</h3>' +
          '<p>Россиядан Кыргызстанга посылкаларды жана жүктөрдү жеткирүү.</p>' +
          '<h3>Кыргызстан → Россия</h3>' +
          '<p>Кыргызстандан Россияга жүк жөнөтүү.</p>',
      },
      // --- О нас (убираем оговорку про Китай) ---
      {
        slug: 'cargo-o-nas',
        language: 'ru',
        like: '%Кита%',
        content:
          '<h2>О компании AsDi Cargo</h2>' +
          '<p>AsDi Cargo — карго-компания, которая специализируется на перевозке консолидированных (сборных) грузов между Кыргызстаном и Россией.</p>' +
          '<p>Мы принимаем, консолидируем и доставляем ваши посылки и грузы «под ключ», а оформление и отслеживание проходят прямо в Telegram-боте — быстро и прозрачно.</p>' +
          '<h3>Почему нам доверяют</h3>' +
          '<p>С 2020 года мы помогаем тысячам клиентов получать покупки и отправлять грузы вовремя и в целости. Прозрачные цены, удобное отслеживание и поддержка на связи — на каждом этапе.</p>' +
          '<h3>Свяжитесь с нами</h3>' +
          '<p>Остались вопросы? Напишите нам в Telegram-бот или по контактам внизу страницы — мы поможем оформить доставку за пару минут.</p>',
      },
      {
        slug: 'cargo-o-nas',
        language: 'en',
        like: '%China%',
        content:
          '<h2>About AsDi Cargo</h2>' +
          '<p>AsDi Cargo is a cargo company specializing in the transport of consolidated (groupage) cargo between Kyrgyzstan and Russia.</p>' +
          '<p>We receive, consolidate and deliver your parcels and cargo end to end, while ordering and tracking happen right in the Telegram bot — fast and transparent.</p>' +
          '<h3>Why clients trust us</h3>' +
          '<p>Since 2020 we have helped thousands of clients receive their purchases and ship cargo on time and intact. Transparent pricing, convenient tracking and responsive support — at every step.</p>' +
          '<h3>Get in touch</h3>' +
          '<p>Have questions? Message us in the Telegram bot or use the contacts at the bottom of the page — we will help you arrange delivery in a couple of minutes.</p>',
      },
      {
        slug: 'cargo-o-nas',
        language: 'ky',
        like: '%Кытай%',
        content:
          '<h2>AsDi Cargo компаниясы жөнүндө</h2>' +
          '<p>AsDi Cargo — Кыргызстан менен Россиянын ортосунда топтолгон (сборный) жүктөрдү ташууга адистешкен карго-компания.</p>' +
          '<p>Биз сиздин посылкаларыңызды жана жүктөрүңүздү кабыл алабыз, топтойбуз жана «ачкычка чейин» жеткиребиз, ал эми таштоо менен көзөмөл түз эле Telegram-ботто өтөт — тез жана ачык.</p>' +
          '<h3>Эмне үчүн бизге ишенишет</h3>' +
          '<p>2020-жылдан бери биз миңдеген кардарларга буюмдарын өз убагында жана бүтүн алууга жана жүк жөнөтүүгө жардам берип келебиз. Ачык баалар, ыңгайлуу көзөмөл жана байланыштагы колдоо — ар бир этапта.</p>' +
          '<h3>Биз менен байланышыңыз</h3>' +
          '<p>Суроолор калдыбы? Telegram-ботко жазыңыз же барактын ылдыйындагы байланыштар аркылуу — биз жеткирүүнү бир-эки мүнөттө тариздөөгө жардам беребиз.</p>',
      },
    ];

    for (const f of fixes) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = $1, "updatedAt" = now() ` +
          `WHERE "slug" = $2 AND "language" = $3 AND "content" LIKE $4`,
        [f.content, f.slug, f.language, f.like],
      );
    }
  }

  public async down(): Promise<void> {
    // Необратимая правка контента — откат не восстанавливает упоминания Китая.
  }
}
