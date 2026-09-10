/**
 * На не-production окружениях (staging) добавляем заголовок X-Robots-Tag: noindex
 * ко всем ответам — это перекрывает и не-HTML ресурсы, и случай, когда бот
 * игнорирует мета-тег. В production заголовок не выставляем.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const isProductionSite = String(config.public.siteEnv ?? 'production') === 'production';
  if (!isProductionSite) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow');
  }
});
