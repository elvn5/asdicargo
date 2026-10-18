<script setup lang="ts">
const { locale, locales } = useI18n();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const siteUrl = String(runtimeConfig.public.siteUrl ?? 'https://asdicargo.com').replace(/\/$/, '');
const botUrl = String(runtimeConfig.public.botUrl ?? 'https://t.me/asdicargo_bot');
// Индексируем только production; staging и прочие окружения закрываем от поисковиков.
const isProductionSite = String(runtimeConfig.public.siteEnv ?? 'production') === 'production';

const currentLanguage = computed(() => {
  const list = locales.value as Array<{ code: string; language: string }>;
  return list.find((l) => l.code === locale.value)?.language ?? 'ru-RU';
});

const organizationLd = computed(() =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AsDi Cargo',
    url: siteUrl,
    description: 'Карго и доставка грузов: Россия — Кыргызстан, Кыргызстан — Россия.',
    areaServed: 'KG',
    sameAs: [botUrl],
  }),
);

// Глобальные SEO-дефолты: язык документа, canonical, Open Graph / Twitter,
// микроразметка организации. Страницы дополняют/переопределяют своими тегами.
useHead(() => ({
  htmlAttrs: { lang: currentLanguage.value },
  link: [
    { rel: 'canonical', href: siteUrl + route.path },
    // Montserrat (латиница + кириллица) — основной шрифт сайта.
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap&subset=cyrillic',
    },
    // Иконки и манифест PWA (кабинет можно установить на телефон).
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32.png' },
    { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ],
  meta: [
    { property: 'og:site_name', content: 'AsDi Cargo' },
    { name: 'theme-color', content: '#c33a22' },
    { name: 'apple-mobile-web-app-title', content: 'AsDi Cargo' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: siteUrl + route.path },
    { name: 'twitter:card', content: 'summary_large_image' },
    // На не-production закрываем от индексации на уровне мета-тега.
    ...(isProductionSite ? [] : [{ name: 'robots', content: 'noindex, nofollow' }]),
  ],
  script: [{ type: 'application/ld+json', innerHTML: organizationLd.value }],
}));
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
