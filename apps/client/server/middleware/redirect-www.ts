/**
 * 301 с www.asdicargo.com на asdicargo.com (с сохранением пути и query),
 * чтобы поисковики не видели два одинаковых сайта. nginx проксирует www на
 * этот же сервер и передаёт Host / X-Forwarded-Proto.
 */
export default defineEventHandler((event) => {
  const host = getRequestHost(event, { xForwardedHost: true });
  if (!host.toLowerCase().startsWith('www.')) return;

  const protocol = getRequestProtocol(event, { xForwardedProto: true });
  return sendRedirect(event, `${protocol}://${host.slice(4)}${event.path}`, 301);
});
