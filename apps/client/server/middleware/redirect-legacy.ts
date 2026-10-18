/**
 * 301-редиректы со старых адресов, чтобы не терять ссылки и индексацию:
 *  - блог (/blog, /blog/:slug и /ky, /en варианты) → /cargo-blog;
 *  - убранная страница «Документы» (/cargo-dokumenti) → /cargo-kontakty.
 */
export default defineEventHandler((event) => {
  const [rawPath, search] = event.path.split('?');
  const pathname = rawPath ?? '';

  // Публичная страница «Документы» убрана — ведём старые ссылки в «Контакты»
  // (документы для перевозки согласует менеджер).
  const docs = pathname.match(/^(\/(?:ky|en))?\/cargo-dokumenti\/?$/);
  if (docs) {
    return sendRedirect(event, `${docs[1] ?? ''}/cargo-kontakty`, 301);
  }

  const match = pathname.match(/^(\/(?:ky|en))?\/blog(\/.*)?$/);
  if (!match) return;

  const prefix = match[1] ?? '';
  const rest = match[2] ?? '';
  const query = search ? `?${search}` : '';
  return sendRedirect(event, `${prefix}/cargo-blog${rest}${query}`, 301);
});
