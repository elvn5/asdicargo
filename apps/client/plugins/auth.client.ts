/**
 * Клиентский бутстрап сессии: один раз при загрузке приложения в браузере
 * подтягиваем профиль (/account/me). На сервере не выполняется, поэтому
 * cookie сессии (scoped на api-сабдомен) не мешает SSR-рендеру.
 */
export default defineNuxtPlugin(async () => {
  await useAuthStore().fetchMe();
});
