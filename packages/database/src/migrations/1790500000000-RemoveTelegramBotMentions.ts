import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Telegram-бота больше нет, а в страницах «О нас», FAQ и в скрытых «Контакты» /
 * «Документы» остались фразы про него. Меняем только эти фразы и только там,
 * где текст не правили в админке (ищем исходную формулировку целиком).
 */
const REPLACEMENTS: Array<{ slug: string; language: 'ru' | 'ky' | 'en'; from: string; to: string }> = [
  // «О нас»
  {
    slug: 'cargo-o-nas',
    language: 'ru',
    from: 'а оформление и отслеживание проходят прямо в Telegram-боте — быстро и прозрачно.',
    to: 'а рассчитать стоимость, оформить заявку и отследить посылку можно прямо на сайте и в личном кабинете — быстро и прозрачно.',
  },
  {
    slug: 'cargo-o-nas',
    language: 'ru',
    from: 'Напишите нам в Telegram-бот или по контактам внизу страницы',
    to: 'Напишите нам в WhatsApp или Telegram либо воспользуйтесь контактами внизу страницы',
  },
  {
    slug: 'cargo-o-nas',
    language: 'ky',
    from: 'ал эми таштоо менен көзөмөл түз эле Telegram-ботто өтөт — тез жана ачык.',
    to: 'ал эми наркын эсептөө, арыз тариздөө жана посылканы көзөмөлдөө түз эле сайтта жана жеке кабинетте — тез жана ачык.',
  },
  {
    slug: 'cargo-o-nas',
    language: 'ky',
    from: 'Telegram-ботко жазыңыз же барактын ылдыйындагы байланыштар аркылуу',
    to: 'WhatsApp же Telegram аркылуу жазыңыз же барактын ылдыйындагы байланыштарды колдонуңуз',
  },
  {
    slug: 'cargo-o-nas',
    language: 'en',
    from: 'while ordering and tracking happen right in the Telegram bot — fast and transparent.',
    to: 'while cost estimates, booking and tracking happen right on the website and in your account — fast and transparent.',
  },
  {
    slug: 'cargo-o-nas',
    language: 'en',
    from: 'Message us in the Telegram bot or use the contacts',
    to: 'Message us on WhatsApp or Telegram, or use the contacts',
  },
  // FAQ
  {
    slug: 'cargo-faq',
    language: 'ru',
    from: 'Запустите Telegram-бота, получите персональный адрес склада и укажите его при оформлении покупки в магазине.',
    to: 'Зарегистрируйтесь в личном кабинете и оформите заявку на перевозку — менеджер подтвердит её и подскажет адрес склада для ваших покупок.',
  },
  {
    slug: 'cargo-faq',
    language: 'ru',
    from: 'Статус посылки отображается в реальном времени в Telegram-боте.',
    to: 'Введите трек-номер в блоке «Отследите груз» на главной странице или откройте посылку в личном кабинете — там же приходят уведомления о смене статуса.',
  },
  {
    slug: 'cargo-faq',
    language: 'ru',
    from: 'Рассчитать её можно в боте.',
    to: 'Рассчитать её можно в калькуляторе на сайте.',
  },
  {
    slug: 'cargo-faq',
    language: 'ru',
    from: 'В удобном пункте выдачи — адреса доступны в боте.',
    to: 'В удобном пункте выдачи — адреса, часы работы и карта есть на странице «Контакты» и в личном кабинете.',
  },
  {
    slug: 'cargo-faq',
    language: 'ky',
    from: 'Telegram-ботту иштетиңиз, кампанын жеке дарегин алыңыз да, дүкөндө буйрутма бергенде аны көрсөтүңүз.',
    to: 'Жеке кабинетке катталып, жеткирүүгө арыз бериңиз — менеджер аны ырастап, сатып алууларыңыз үчүн кампанын дарегин айтып берет.',
  },
  {
    slug: 'cargo-faq',
    language: 'ky',
    from: 'Посылканын абалы Telegram-ботто реалдуу убакытта көрсөтүлөт.',
    to: 'Башкы беттеги «Жүктү көзөмөлдөө» блогуна трек-номерди киргизиңиз же посылканы жеке кабинетте ачыңыз — абалы өзгөргөндө ошол жерге билдирме келет.',
  },
  {
    slug: 'cargo-faq',
    language: 'ky',
    from: 'Аны ботто эсептесе болот.',
    to: 'Аны сайттагы калькулятордо эсептесе болот.',
  },
  {
    slug: 'cargo-faq',
    language: 'ky',
    from: 'Ыңгайлуу берүү пунктунан — даректер ботто бар.',
    to: 'Ыңгайлуу берүү пунктунан — даректер, иш убактысы жана карта «Байланыш» барагында жана жеке кабинетте бар.',
  },
  {
    slug: 'cargo-faq',
    language: 'en',
    from: 'Start the Telegram bot, get your personal warehouse address and enter it when placing an order in a store.',
    to: 'Sign up for an account and create a shipment request — a manager will confirm it and give you the warehouse address for your purchases.',
  },
  {
    slug: 'cargo-faq',
    language: 'en',
    from: 'The parcel status is shown in real time in the Telegram bot.',
    to: 'Enter your tracking number in the “Track your cargo” block on the home page or open the parcel in your account — you also get notifications when the status changes.',
  },
  {
    slug: 'cargo-faq',
    language: 'en',
    from: 'You can calculate it in the bot.',
    to: 'You can estimate it with the calculator on the website.',
  },
  {
    slug: 'cargo-faq',
    language: 'en',
    from: 'At a convenient pickup point — addresses are available in the bot.',
    to: 'At a convenient pickup point — addresses, working hours and a map are on the Contacts page and in your account.',
  },
  // Скрытые «Контакты» и «Документы» (на случай повторного включения в админке)
  {
    slug: 'cargo-kontakty',
    language: 'ru',
    from: 'Самый быстрый — через Telegram-бот.',
    to: 'Самый быстрый — через WhatsApp или Telegram.',
  },
  {
    slug: 'cargo-kontakty',
    language: 'ky',
    from: 'Эң тезинен — Telegram-бот аркылуу.',
    to: 'Эң тезинен — WhatsApp же Telegram аркылуу.',
  },
  {
    slug: 'cargo-kontakty',
    language: 'en',
    from: 'The fastest is via the Telegram bot.',
    to: 'The fastest is via WhatsApp or Telegram.',
  },
  {
    slug: 'cargo-dokumenti',
    language: 'ru',
    from: 'пишите нам в Telegram-бот.',
    to: 'пишите нам в WhatsApp или Telegram.',
  },
  {
    slug: 'cargo-dokumenti',
    language: 'ky',
    from: 'бизге Telegram-ботко жазыңыз.',
    to: 'бизге WhatsApp же Telegram аркылуу жазыңыз.',
  },
  {
    slug: 'cargo-dokumenti',
    language: 'en',
    from: 'message us in the Telegram bot.',
    to: 'message us on WhatsApp or Telegram.',
  },
];

export class RemoveTelegramBotMentions1790500000000 implements MigrationInterface {
  name = 'RemoveTelegramBotMentions1790500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const r of REPLACEMENTS) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = replace("content", $1, $2)
         WHERE "slug" = $3 AND "language" = $4 AND position($1 in "content") > 0`,
        [r.from, r.to, r.slug, r.language],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const r of REPLACEMENTS) {
      await queryRunner.query(
        `UPDATE "site_pages" SET "content" = replace("content", $2, $1)
         WHERE "slug" = $3 AND "language" = $4 AND position($2 in "content") > 0`,
        [r.from, r.to, r.slug, r.language],
      );
    }
  }
}
