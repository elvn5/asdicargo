<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

// Родительский маршрут личного кабинета: навигация + <NuxtPage /> для разделов.
// middleware наследуется дочерними маршрутами (Nuxt проверяет все matched).
definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const auth = useAuthStore();
const { loggingOut, logout } = useLogout();
const { unread, startPolling } = useNotifications();

// Счётчик непрочитанных обновляем только в браузере (на сервере нет сессии).
onMounted(startPolling);

useHead({
  title: () => `${t('auth.accountTitle')} — AsDi Cargo`,
  meta: [{ name: 'robots', content: 'noindex' }],
});

interface NavLink {
  key: string;
  to: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const p = (path: string): string => localePath(path);

// Боковое меню (десктоп).
const sideLinks = computed<NavLink[]>(() => [
  {
    key: 'dashboard',
    to: p('/account'),
    label: t('account.nav.dashboard'),
    icon: 'i-lucide-layout-dashboard',
    exact: true,
  },
  {
    key: 'parcels',
    to: p('/account/parcels'),
    label: t('account.nav.parcels'),
    icon: 'i-lucide-package',
  },
  {
    key: 'requests',
    to: p('/account/requests'),
    label: t('account.nav.requests'),
    icon: 'i-lucide-clipboard-list',
  },
  {
    key: 'appeals',
    to: p('/account/appeals'),
    label: t('account.nav.appeals'),
    icon: 'i-lucide-message-square-warning',
  },
  {
    key: 'documents',
    to: p('/account/documents'),
    label: t('account.nav.documents'),
    icon: 'i-lucide-files',
  },
  {
    key: 'notifications',
    to: p('/account/notifications'),
    label: t('account.nav.notifications'),
    icon: 'i-lucide-bell',
  },
  {
    key: 'addresses',
    to: p('/account/addresses'),
    label: t('account.nav.addresses'),
    icon: 'i-lucide-book-user',
  },
  {
    key: 'points',
    to: p('/account/points'),
    label: t('account.nav.points'),
    icon: 'i-lucide-map-pin',
  },
  {
    key: 'profile',
    to: p('/account/profile'),
    label: t('account.nav.profile'),
    icon: 'i-lucide-user-round',
  },
]);

function linkByKey(key: string): NavLink {
  return (
    sideLinks.value.find((l) => l.key === key) ?? {
      key,
      to: p('/account'),
      label: key,
      icon: 'i-lucide-circle',
    }
  );
}

// Вкладки нижнего мобильного меню (кроме «+ Заявка» и «Ещё»).
const mobileLeft = computed(() => [linkByKey('dashboard'), linkByKey('parcels')]);
const mobilePoints = computed(() => linkByKey('points'));

// Разделы, которые на мобильных живут под вкладкой «Ещё».
const morePaths = computed(() =>
  [
    '/account/more',
    '/account/requests',
    '/account/appeals',
    '/account/documents',
    '/account/notifications',
    '/account/addresses',
    '/account/profile',
  ].map(p),
);

function isActive(link: NavLink): boolean {
  if (link.exact) return route.path === link.to;
  // «Новая заявка» не подсвечивает «Мои заявки» и наоборот.
  if (link.to === p('/account/requests') && route.path === p('/account/requests/new')) return false;
  return route.path.startsWith(link.to);
}

const isNewRequest = computed(() => route.path === p('/account/requests/new'));
const isMoreActive = computed(
  () => !isNewRequest.value && morePaths.value.some((path) => route.path.startsWith(path)),
);
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:pt-12 lg:pb-16">
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

            <UButton :to="p('/account/requests/new')" icon="i-lucide-plus" block size="lg" class="rounded-xl">
              {{ t('account.nav.newRequest') }}
            </UButton>

            <nav class="flex flex-col gap-1">
              <NuxtLink
                v-for="link in sideLinks"
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
                <span class="flex-1">{{ link.label }}</span>
                <span
                  v-if="link.key === 'notifications' && unread > 0"
                  class="min-w-5 rounded-full bg-brand-500 px-1.5 text-center text-xs font-semibold leading-5 text-white"
                >
                  {{ unread > 99 ? '99+' : unread }}
                </span>
              </NuxtLink>
              <NuxtLink
                :to="p('/cargo-kalkulyator')"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-steel-600 transition hover:bg-steel-100 dark:text-steel-300 dark:hover:bg-steel-800/60"
              >
                <UIcon name="i-lucide-calculator" class="size-5" />
                {{ t('account.nav.calculator') }}
              </NuxtLink>
              <button
                type="button"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-steel-500 transition hover:bg-steel-100 hover:text-red-600 disabled:opacity-60 dark:text-steel-400 dark:hover:bg-steel-800/60"
                :disabled="loggingOut"
                @click="logout"
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
      <AccountOnboarding />

      <template #fallback>
        <div class="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
          <div class="hidden space-y-3 lg:block">
            <USkeleton class="h-16 w-full rounded-brand-lg" />
            <USkeleton v-for="n in 9" :key="n" class="h-10 w-full rounded-xl" />
          </div>
          <div class="space-y-4">
            <USkeleton class="h-9 w-64" />
            <USkeleton class="h-32 w-full rounded-brand-lg" />
            <USkeleton class="h-64 w-full rounded-brand-lg" />
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Нижнее меню (мобильные): Главная · Посылки · [+ Заявка] · Пункты · Ещё -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-steel-200 bg-white/95 backdrop-blur lg:hidden dark:border-steel-800 dark:bg-steel-950/95"
    >
      <div class="mx-auto grid max-w-md grid-cols-5 items-end pb-[env(safe-area-inset-bottom)]">
        <NuxtLink
          v-for="link in mobileLeft"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition"
          :class="isActive(link) ? 'text-brand-600 dark:text-brand-400' : 'text-steel-500 dark:text-steel-400'"
        >
          <UIcon :name="link.icon" class="size-5" />
          <span class="max-w-full truncate px-1">{{ link.label }}</span>
        </NuxtLink>

        <NuxtLink
          :to="p('/account/requests/new')"
          class="flex flex-col items-center gap-1 pb-2.5 text-[11px] font-medium"
          :class="isNewRequest ? 'text-brand-600 dark:text-brand-400' : 'text-steel-500 dark:text-steel-400'"
        >
          <span
            class="-mt-5 flex size-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-brand-500/30 ring-4 ring-white dark:ring-steel-950"
          >
            <UIcon name="i-lucide-plus" class="size-6" />
          </span>
          {{ t('account.nav.request') }}
        </NuxtLink>

        <NuxtLink
          :to="mobilePoints.to"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition"
          :class="isActive(mobilePoints) ? 'text-brand-600 dark:text-brand-400' : 'text-steel-500 dark:text-steel-400'"
        >
          <UIcon :name="mobilePoints.icon" class="size-5" />
          <span class="max-w-full truncate px-1">{{ mobilePoints.label }}</span>
        </NuxtLink>

        <NuxtLink
          :to="p('/account/more')"
          class="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition"
          :class="isMoreActive ? 'text-brand-600 dark:text-brand-400' : 'text-steel-500 dark:text-steel-400'"
        >
          <span class="relative">
            <UIcon name="i-lucide-menu" class="size-5" />
            <!-- Точка — есть непрочитанные уведомления. -->
            <span
              v-if="unread > 0"
              class="absolute -right-1 -top-0.5 size-2.5 rounded-full bg-brand-500 ring-2 ring-white dark:ring-steel-950"
            />
          </span>
          {{ t('account.nav.more') }}
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
