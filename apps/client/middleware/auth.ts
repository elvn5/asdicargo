import { useAuthStore } from '~/stores/auth';

/**
 * Защищает страницы личного кабинета: если сессии нет — редирект на вход.
 * Подключается на странице через definePageMeta({ middleware: 'auth' }).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  await auth.fetchMe();

  if (!auth.isAuthenticated) {
    const localePath = useLocalePath();
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath },
    });
  }
});
