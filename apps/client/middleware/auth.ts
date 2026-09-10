/**
 * Защита страниц личного кабинета. Проверка выполняется на клиенте
 * (сессия определяется там же, где живёт cookie); на сервере пропускаем.
 * Подключается на странице через definePageMeta({ middleware: 'auth' }).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  await auth.fetchMe();

  if (!auth.isAuthenticated) {
    return navigateTo({
      path: useLocalePath()('/login'),
      query: { redirect: to.fullPath },
    });
  }
});
