export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system', // по умолчанию следуем системе; переключатель ставит явное значение
    fallback: 'light',
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ru',
    // Абсолютный базовый URL сайта — нужен для canonical/hreflang/sitemap.
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://asdicargo.com',
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'ky', language: 'ky-KG', name: 'Кыргызча', file: 'ky.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  },
  runtimeConfig: {
    // Серверный (SSR) URL API — внутри Docker это http://api:3001.
    apiInternalUrl: process.env.NUXT_API_INTERNAL_URL ?? 'http://localhost:3001',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
      // Версия задеплоенного образа для футера (задаётся в рантайме через NUXT_PUBLIC_APP_VERSION).
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION ?? '',
      botUrl: process.env.NUXT_PUBLIC_BOT_URL ?? 'https://t.me/asdicargo_bot',
      // Канонический адрес сайта (для SEO-тегов и sitemap).
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://asdicargo.com',
      // Окружение сайта: 'production' индексируется, любое другое (staging) — нет.
      siteEnv: process.env.NUXT_PUBLIC_SITE_ENV ?? 'production',
      // Имя Telegram-бота (без @) для Telegram Login Widget.
      telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '',
    },
  },
  // Предсжатие статики (CSS/JS/шрифты) в .gz и .br на этапе билда.
  // Nitro сам отдаёт нужный вариант по Accept-Encoding — 210 КБ CSS
  // превращаются в ~22 КБ (brotli) по сети без изменения nginx.
  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },
  typescript: {
    strict: true,
  },
});
