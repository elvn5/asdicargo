export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system', // по умолчанию следуем системе; переключатель ставит явное значение
    fallback: 'light',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
      botUrl: process.env.NUXT_PUBLIC_BOT_URL ?? 'https://t.me/asdicargo_bot',
    },
  },
  typescript: {
    strict: true,
  },
});
