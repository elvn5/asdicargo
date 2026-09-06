/**
 * 301-редиректы со старых адресов блога (/blog, /blog/:slug и их локализованных
 * вариантов /ky/blog, /en/blog) на новые /cargo-blog — чтобы не терять ссылки
 * и поисковую индексацию после переименования маршрута.
 */
export default defineEventHandler((event) => {
  const [pathname, search] = event.path.split('?');
  const match = pathname.match(/^(\/(?:ky|en))?\/blog(\/.*)?$/);
  if (!match) return;

  const prefix = match[1] ?? '';
  const rest = match[2] ?? '';
  const query = search ? `?${search}` : '';
  return sendRedirect(event, `${prefix}/cargo-blog${rest}${query}`, 301);
});
