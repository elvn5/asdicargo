/**
 * Динамический robots.txt.
 *  - production: разрешаем индексацию и указываем sitemap;
 *  - любое другое окружение (staging): полностью закрываем от поисковиков.
 * Окружение берём из NUXT_PUBLIC_SITE_ENV (runtimeConfig.public.siteEnv).
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(config.public.siteUrl ?? 'https://asdicargo.com').replace(/\/$/, '');
  const isProductionSite = String(config.public.siteEnv ?? 'production') === 'production';

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');

  const body = isProductionSite
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  return body;
});
