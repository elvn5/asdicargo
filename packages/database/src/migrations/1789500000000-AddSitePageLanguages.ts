import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Мультиязычность контентных страниц. Добавляет колонку language (enum
 * ru/ky/en), заменяет уникальный индекс по slug на составной (slug, language),
 * и засевает переводы: EN/KY для существующих русских страниц + новая страница
 * «О нас» (cargo-o-nas) на трёх языках.
 */
export class AddSitePageLanguages1789500000000 implements MigrationInterface {
  name = 'AddSitePageLanguages1789500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) enum-тип и колонка language (существующие строки получают 'ru').
    await queryRunner.query(
      `CREATE TYPE "public"."site_pages_language_enum" AS ENUM('ru', 'ky', 'en')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_pages" ADD "language" "public"."site_pages_language_enum" NOT NULL DEFAULT 'ru'`,
    );

    // 2) уникальность теперь по паре (slug, language).
    await queryRunner.query(`DROP INDEX "public"."IDX_site_pages_slug"`);
    await queryRunner.query(`CREATE INDEX "IDX_site_pages_slug" ON "site_pages" ("slug")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_site_pages_slug_language" ON "site_pages" ("slug", "language")`,
    );

    // 3) Засев переводов. Русские строки для 5 слагов уже есть — добавляем en/ky,
    //    и полностью новую страницу «О нас» (ru/en/ky).
    const seed: Array<{ slug: string; language: 'ru' | 'ky' | 'en'; title: string; content: string }> = [
      // --- Услуги ---
      {
        slug: 'cargo-uslugi',
        language: 'en',
        title: 'Services',
        content:
          '<h2>Our services</h2>' +
          '<p>AsDi Cargo receives, ships and hands over your cargo and parcels. Ordering and tracking happen right in the Telegram bot.</p>' +
          '<h3>Parcel receiving</h3>' +
          '<p>A personal warehouse address — shop in foreign stores and pick up your orders with us.</p>' +
          '<h3>Cargo delivery</h3>' +
          '<p>Fast and reliable transport from the warehouse to your city.</p>' +
          '<h3>Pickup points</h3>' +
          '<p>Convenient pickup addresses — choose the one nearest to you.</p>',
      },
      {
        slug: 'cargo-uslugi',
        language: 'ky',
        title: 'Кызматтар',
        content:
          '<h2>Биздин кызматтар</h2>' +
          '<p>AsDi Cargo сиздин жүктөрүңүздү жана посылкаларыңызды кабыл алат, ташыйт жана берет. Таштоо жана көзөмөл — Telegram-ботто.</p>' +
          '<h3>Посылкаларды кабыл алуу</h3>' +
          '<p>Кампадагы жеке дарек — чет элдик дүкөндөрдөн буйрутма бериңиз да, бизден алыңыз.</p>' +
          '<h3>Жүк жеткирүү</h3>' +
          '<p>Кампадан шаарыңызга чейин тез жана ишенимдүү ташуу.</p>' +
          '<h3>Берүү пункттары</h3>' +
          '<p>Ыңгайлуу даректер — өзүңүзгө жакынын тандаңыз.</p>',
      },
      // --- Направления ---
      {
        slug: 'cargo-napravleniya',
        language: 'en',
        title: 'Directions',
        content:
          '<h2>Delivery directions</h2>' +
          '<p>We carry cargo along three main routes.</p>' +
          '<h3>China → Kyrgyzstan</h3>' +
          '<p>Delivery of goods and cargo from China to Kyrgyzstan.</p>' +
          '<h3>Russia → Kyrgyzstan</h3>' +
          '<p>Delivery of parcels and cargo from Russia to Kyrgyzstan.</p>' +
          '<h3>Kyrgyzstan → Russia</h3>' +
          '<p>Shipping cargo from Kyrgyzstan to Russia.</p>',
      },
      {
        slug: 'cargo-napravleniya',
        language: 'ky',
        title: 'Багыттар',
        content:
          '<h2>Жеткирүү багыттары</h2>' +
          '<p>Биз жүктөрдү үч негизги багыт боюнча ташыйбыз.</p>' +
          '<h3>Кытай → Кыргызстан</h3>' +
          '<p>Кытайдан Кыргызстанга товарларды жана жүктөрдү жеткирүү.</p>' +
          '<h3>Россия → Кыргызстан</h3>' +
          '<p>Россиядан Кыргызстанга посылкаларды жана жүктөрдү жеткирүү.</p>' +
          '<h3>Кыргызстан → Россия</h3>' +
          '<p>Кыргызстандан Россияга жүк жөнөтүү.</p>',
      },
      // --- Документы ---
      {
        slug: 'cargo-dokumenti',
        language: 'en',
        title: 'Documents',
        content:
          '<h2>Documents</h2>' +
          '<p>Here we will publish the documents needed to arrange and receive cargo: terms of service, shipping rules and the list of items prohibited for shipment.</p>' +
          '<p>This section is being filled in. For any questions, message us in the Telegram bot.</p>',
      },
      {
        slug: 'cargo-dokumenti',
        language: 'ky',
        title: 'Документтер',
        content:
          '<h2>Документтер</h2>' +
          '<p>Бул жерде жүктү таштоо жана алуу үчүн керектүү документтер жайгаштырылат: тейлөө шарттары, ташуу эрежелери жана жөнөтүүгө тыюу салынган товарлардын тизмеси.</p>' +
          '<p>Бөлүм толтурулууда. Суроолор боюнча бизге Telegram-ботко жазыңыз.</p>',
      },
      // --- Вопрос-Ответ ---
      {
        slug: 'cargo-faq',
        language: 'en',
        title: 'FAQ',
        content:
          '<h2>Frequently asked questions</h2>' +
          '<h3>How do I arrange delivery?</h3>' +
          '<p>Start the Telegram bot, get your personal warehouse address and enter it when placing an order in a store.</p>' +
          '<h3>How do I track a parcel?</h3>' +
          '<p>The parcel status is shown in real time in the Telegram bot.</p>' +
          '<h3>How much does delivery cost?</h3>' +
          '<p>The cost depends on weight and direction. You can calculate it in the bot.</p>' +
          '<h3>Where do I pick up my order?</h3>' +
          '<p>At a convenient pickup point — addresses are available in the bot.</p>',
      },
      {
        slug: 'cargo-faq',
        language: 'ky',
        title: 'Суроо-Жооп',
        content:
          '<h2>Көп берилүүчү суроолор</h2>' +
          '<h3>Жеткирүүнү кантип тариздейм?</h3>' +
          '<p>Telegram-ботту иштетиңиз, кампанын жеке дарегин алыңыз да, дүкөндө буйрутма бергенде аны көрсөтүңүз.</p>' +
          '<h3>Посылканы кантип көзөмөлдөйм?</h3>' +
          '<p>Посылканын абалы Telegram-ботто реалдуу убакытта көрсөтүлөт.</p>' +
          '<h3>Жеткирүү канча турат?</h3>' +
          '<p>Наркы салмагына жана багытына жараша. Аны ботто эсептесе болот.</p>' +
          '<h3>Буйрутманы кайдан алам?</h3>' +
          '<p>Ыңгайлуу берүү пунктунан — даректер ботто бар.</p>',
      },
      // --- Контакты ---
      {
        slug: 'cargo-kontakty',
        language: 'en',
        title: 'Contacts',
        content:
          '<h2>Contacts</h2>' +
          '<p>Get in touch with us in any convenient way. The fastest is via the Telegram bot.</p>' +
          '<p>Phone, pickup point address and working hours will be added here.</p>',
      },
      {
        slug: 'cargo-kontakty',
        language: 'ky',
        title: 'Байланыш',
        content:
          '<h2>Байланыш</h2>' +
          '<p>Биз менен ыңгайлуу жол менен байланышыңыз. Эң тезинен — Telegram-бот аркылуу.</p>' +
          '<p>Телефон, берүү пунктунун дареги жана иштөө убактысы бул жерге кошулат.</p>',
      },
      // --- О нас (новая страница, все три языка) ---
      {
        slug: 'cargo-o-nas',
        language: 'ru',
        title: 'О нас',
        content:
          '<h2>О компании AsDi Cargo</h2>' +
          '<p>AsDi Cargo — карго-компания, которая специализируется на перевозке консолидированных (сборных) грузов между Кыргызстаном и Россией, а также доставке товаров из Китая.</p>' +
          '<p>Мы принимаем, консолидируем и доставляем ваши посылки и грузы «под ключ», а оформление и отслеживание проходят прямо в Telegram-боте — быстро и прозрачно.</p>' +
          '<h3>Почему нам доверяют</h3>' +
          '<p>С 2020 года мы помогаем тысячам клиентов получать покупки и отправлять грузы вовремя и в целости. Прозрачные цены, удобное отслеживание и поддержка на связи — на каждом этапе.</p>' +
          '<h3>Свяжитесь с нами</h3>' +
          '<p>Остались вопросы? Напишите нам в Telegram-бот или по контактам внизу страницы — мы поможем оформить доставку за пару минут.</p>',
      },
      {
        slug: 'cargo-o-nas',
        language: 'en',
        title: 'About us',
        content:
          '<h2>About AsDi Cargo</h2>' +
          '<p>AsDi Cargo is a cargo company specializing in the transport of consolidated (groupage) cargo between Kyrgyzstan and Russia, as well as delivery of goods from China.</p>' +
          '<p>We receive, consolidate and deliver your parcels and cargo end to end, while ordering and tracking happen right in the Telegram bot — fast and transparent.</p>' +
          '<h3>Why clients trust us</h3>' +
          '<p>Since 2020 we have helped thousands of clients receive their purchases and ship cargo on time and intact. Transparent pricing, convenient tracking and responsive support — at every step.</p>' +
          '<h3>Get in touch</h3>' +
          '<p>Have questions? Message us in the Telegram bot or use the contacts at the bottom of the page — we will help you arrange delivery in a couple of minutes.</p>',
      },
      {
        slug: 'cargo-o-nas',
        language: 'ky',
        title: 'Биз жөнүндө',
        content:
          '<h2>AsDi Cargo компаниясы жөнүндө</h2>' +
          '<p>AsDi Cargo — Кыргызстан менен Россиянын ортосунда топтолгон (сборный) жүктөрдү ташууга, ошондой эле Кытайдан товарларды жеткирүүгө адистешкен карго-компания.</p>' +
          '<p>Биз сиздин посылкаларыңызды жана жүктөрүңүздү кабыл алабыз, топтойбуз жана «ачкычка чейин» жеткиребиз, ал эми таштоо менен көзөмөл түз эле Telegram-ботто өтөт — тез жана ачык.</p>' +
          '<h3>Эмне үчүн бизге ишенишет</h3>' +
          '<p>2020-жылдан бери биз миңдеген кардарларга буюмдарын өз убагында жана бүтүн алууга жана жүк жөнөтүүгө жардам берип келебиз. Ачык баалар, ыңгайлуу көзөмөл жана байланыштагы колдоо — ар бир этапта.</p>' +
          '<h3>Биз менен байланышыңыз</h3>' +
          '<p>Суроолор калдыбы? Telegram-ботко жазыңыз же барактын ылдыйындагы байланыштар аркылуу — биз жеткирүүнү бир-эки мүнөттө тариздөөгө жардам беребиз.</p>',
      },
    ];

    for (const page of seed) {
      await queryRunner.query(
        `INSERT INTO "site_pages" ("slug", "language", "title", "content", "published") VALUES ($1, $2, $3, $4, true)`,
        [page.slug, page.language, page.title, page.content],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем новую страницу и все нерусские переводы, возвращаем схему.
    await queryRunner.query(`DELETE FROM "site_pages" WHERE "slug" = 'cargo-o-nas'`);
    await queryRunner.query(`DELETE FROM "site_pages" WHERE "language" <> 'ru'`);
    await queryRunner.query(`DROP INDEX "public"."UQ_site_pages_slug_language"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_site_pages_slug"`);
    await queryRunner.query(`ALTER TABLE "site_pages" DROP COLUMN "language"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_site_pages_slug" ON "site_pages" ("slug")`);
    await queryRunner.query(`DROP TYPE "public"."site_pages_language_enum"`);
  }
}
