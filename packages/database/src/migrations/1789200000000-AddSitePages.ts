import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Контентные страницы сайта, редактируемые из админки. Таблица + засев
 * фиксированного набора cargo-страниц со стартовым русским контентом.
 */
export class AddSitePages1789200000000 implements MigrationInterface {
  name = 'AddSitePages1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "site_pages" (` +
        `"id" uuid NOT NULL DEFAULT uuid_generate_v4(), ` +
        `"slug" character varying NOT NULL, ` +
        `"title" character varying NOT NULL, ` +
        `"content" text NOT NULL DEFAULT '', ` +
        `"published" boolean NOT NULL DEFAULT true, ` +
        `"createdAt" TIMESTAMP NOT NULL DEFAULT now(), ` +
        `"updatedAt" TIMESTAMP NOT NULL DEFAULT now(), ` +
        `CONSTRAINT "PK_site_pages_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_site_pages_slug" ON "site_pages" ("slug")`,
    );

    const seed: Array<{ slug: string; title: string; content: string }> = [
      {
        slug: 'cargo-uslugi',
        title: 'Услуги',
        content:
          '<h2>Наши услуги</h2>' +
          '<p>AsDi Cargo принимает, перевозит и выдаёт ваши грузы и посылки. Оформление и отслеживание — прямо в Telegram-боте.</p>' +
          '<h3>Приём посылок</h3>' +
          '<p>Персональный адрес на складе — оформляйте покупки в зарубежных магазинах и получайте их у нас.</p>' +
          '<h3>Доставка грузов</h3>' +
          '<p>Быстрая и надёжная перевозка от склада до вашего города.</p>' +
          '<h3>Пункты выдачи</h3>' +
          '<p>Удобные адреса для получения — выбирайте ближайший к вам.</p>',
      },
      {
        slug: 'cargo-napravleniya',
        title: 'Направления',
        content:
          '<h2>Направления доставки</h2>' +
          '<p>Мы возим грузы по трём основным маршрутам.</p>' +
          '<h3>Китай → Кыргызстан</h3>' +
          '<p>Доставка товаров и грузов из Китая в Кыргызстан.</p>' +
          '<h3>Россия → Кыргызстан</h3>' +
          '<p>Доставка посылок и грузов из России в Кыргызстан.</p>' +
          '<h3>Кыргызстан → Россия</h3>' +
          '<p>Отправка грузов из Кыргызстана в Россию.</p>',
      },
      {
        slug: 'cargo-dokumenti',
        title: 'Документы',
        content:
          '<h2>Документы</h2>' +
          '<p>Здесь будут размещены документы, необходимые для оформления и получения грузов: условия обслуживания, правила перевозки и список запрещённых к пересылке товаров.</p>' +
          '<p>Раздел заполняется. По вопросам оформления пишите нам в Telegram-бот.</p>',
      },
      {
        slug: 'cargo-faq',
        title: 'Вопрос-Ответ',
        content:
          '<h2>Часто задаваемые вопросы</h2>' +
          '<h3>Как оформить доставку?</h3>' +
          '<p>Запустите Telegram-бота, получите персональный адрес склада и укажите его при оформлении покупки в магазине.</p>' +
          '<h3>Как отследить посылку?</h3>' +
          '<p>Статус посылки отображается в реальном времени в Telegram-боте.</p>' +
          '<h3>Сколько стоит доставка?</h3>' +
          '<p>Стоимость зависит от веса и направления. Рассчитать её можно в боте.</p>' +
          '<h3>Где забрать заказ?</h3>' +
          '<p>В удобном пункте выдачи — адреса доступны в боте.</p>',
      },
      {
        slug: 'cargo-kontakty',
        title: 'Контакты',
        content:
          '<h2>Контакты</h2>' +
          '<p>Свяжитесь с нами удобным способом. Самый быстрый — через Telegram-бот.</p>' +
          '<p>Телефон, адрес пункта выдачи и часы работы будут добавлены здесь.</p>',
      },
    ];

    for (const page of seed) {
      await queryRunner.query(
        `INSERT INTO "site_pages" ("slug", "title", "content", "published") VALUES ($1, $2, $3, true)`,
        [page.slug, page.title, page.content],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_site_pages_slug"`);
    await queryRunner.query(`DROP TABLE "site_pages"`);
  }
}
