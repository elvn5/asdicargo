<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

// Родительский маршрут личного кабинета: навигация + <NuxtPage /> для разделов.
// middleware наследуется дочерними маршрутами (Nuxt проверяет все matched).
definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const auth = useAuthStore();

useHead({
  title: () => `${t('auth.accountTitle')} — AsDi Cargo`,
  meta: [{ name: 'robots', content: 'noindex' }],
});

const links = computed(() => [
  {
    to: localePath('/account'),
    label: t('account.nav.dashboard'),
    icon: 'i-lucide-layout-dashboard',
    exact: true,
  },
  {
    to: localePath('/account/parcels'),
    label: t('account.nav.parcels'),
    icon: 'i-lucide-package',
    exact: false,
  },
  {
    to: localePath('/account/profile'),
    label: t('account.nav.profile'),
    icon: 'i-lucide-user-round',
    exact: false,
  },
]);

function isActive(link: { to: string; exact: boolean }): boolean {
  return link.exact ? route.path === link.to : route.path.startsWith(link.to);
}

const loggingOut = ref(false);

async function onLogout(): Promise<void> {
  loggingOut.value = true;
  try {
    await auth.logout();
    await navigateTo(localePath('/'));
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:pt-12 lg:pb-16">
    <!-- Сессия есть только в браузере: рендерим кабинет на клиенте, иначе SSR без
         пользователя расходится с гидрацией. Страницы закрыты от индексации. -->
    <ClientOnly>
    <div class="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
      <!-- Боковое меню (десктоп) -->
      <aside class="hidden lg:block">
        <div class="sticky top-28 space-y-4">
          <div
            v-if="auth.user"
            class="flex items-center gap-3 rounded-brand-lg border border-steel-200 bg-white p-4 dark:border-steel-800 dark:bg-steel-900/50"
          >
            <UAvatar :src="auth.user.avatarUrl ?? undefined" :alt="auth.displayName" icon="i-lucide-user" />
            <div class="min-w-0">
              <p class="truncate font-medium">{{ auth.displayName }}</p>
              <p v-if="auth.user.email" class="truncate text-xs text-steel-500 dark:text-steel-400">
                {{ auth.user.email }}
              </p>
            </div>
          </div>

          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
              :class="
                isActive(link)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-steel-600 hover:bg-steel-100 dark:text-steel-300 dark:hover:bg-steel-800/60'
              "
            >
              <UIcon :name="link.icon" class="size-5" />
              {{ link.label }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/cargo-kalkulyator')"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-steel-600 transition hover:bg-steel-100 dark:text-steel-300 dark:hover:bg-steel-800/60"
            >
              <UIcon name="i-lucide-calculator" class="size-5" />
              {{ t('account.nav.calculator') }}
            </NuxtLink>
            <button
              type="button"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-steel-500 transition hover:bg-steel-100 hover:text-red-600 disabled:opacity-60 dark:text-steel-400 dark:hover:bg-steel-800/60"
              :disabled="loggingOut"
              @click="onLogout"
            >
              <UIcon name="i-lucide-log-out" class="size-5" />
              {{ t('account.nav.logout') }}
            </button>
          </nav>
        </div>
      </aside>

      <main class="min-w-0">
        <NuxtPage />
      </main>
    </div>

    <template #fallback>
      <div class="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
        <div class="hidden space-y-3 lg:block">
          <USkeleton class="h-16 w-full rounded-brand-lg" />
          <USkeleton v-for="n in 4" :key="n" class="h-10 w-full rounded-xl" />
        </div>
        <div class="space-y-4">
          <USkeleton class="h-9 w-64" />
          <USkeleton class="h-32 w-full rounded-brand-lg" />
          <USkeleton class="h-64 w-full rounded-brand-lg" />
        </div>
      </div>
    </template>
    </ClientOnly>

    <!-- Нижнее меню (мобильные) -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-steel-200 bg-white/95 backdrop-blur lg:hidden dark:border-steel-800 dark:bg-steel-950/95"
    >
      <div class="mx-auto grid max-w-md grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition"
          :class="isActive(link) ? 'text-brand-600 dark:text-brand-400' : 'text-steel-500 dark:text-steel-400'"
        >
          <UIcon :name="link.icon" class="size-5" />
          <span class="truncate">{{ link.label }}</span>
        </NuxtLink>
        <button
          type="button"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-steel-500 dark:text-steel-400"
          :disabled="loggingOut"
          @click="onLogout"
        >
          <UIcon name="i-lucide-log-out" class="size-5" />
          <span class="truncate">{{ t('account.nav.logout') }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
