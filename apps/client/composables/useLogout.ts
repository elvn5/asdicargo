import { useAuthStore } from '~/stores/auth';

/** Выход из кабинета с переходом на главную; общий для меню кабинета и страницы «Ещё». */
export function useLogout(): { loggingOut: Ref<boolean>; logout: () => Promise<void> } {
  const auth = useAuthStore();
  const localePath = useLocalePath();
  const loggingOut = ref(false);

  async function logout(): Promise<void> {
    loggingOut.value = true;
    try {
      await auth.logout();
      await navigateTo(localePath('/'));
    } finally {
      loggingOut.value = false;
    }
  }

  return { loggingOut, logout };
}
