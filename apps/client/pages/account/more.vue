<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

// Раздел «Ещё» для мобильного нижнего меню: всё, что не поместилось во вкладки.
const { t } = useI18n();
const localePath = useLocalePath();
const auth = useAuthStore();
const { loggingOut, logout } = useLogout();

const { unread } = useNotifications();

const items = computed(() => [
  {
    to: localePath('/account/notifications'),
    label: t('account.nav.notifications'),
    icon: 'i-lucide-bell',
    badge: unread.value,
  },
  {
    to: localePath('/account/requests'),
    label: t('account.nav.requests'),
    icon: 'i-lucide-clipboard-list',
    badge: 0,
  },
  {
    to: localePath('/account/appeals'),
    label: t('account.nav.appeals'),
    icon: 'i-lucide-message-square-warning',
    badge: 0,
  },
  {
    to: localePath('/account/documents'),
    label: t('account.nav.documents'),
    icon: 'i-lucide-files',
    badge: 0,
  },
  {
    to: localePath('/account/addresses'),
    label: t('account.nav.addresses'),
    icon: 'i-lucide-book-user',
    badge: 0,
  },
  {
    to: localePath('/account/profile'),
    label: t('account.nav.profile'),
    icon: 'i-lucide-user-round',
    badge: 0,
  },
  {
    to: localePath('/cargo-kalkulyator'),
    label: t('account.nav.calculator'),
    icon: 'i-lucide-calculator',
    badge: 0,
  },
]);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('account.more.title') }}</h1>

    <div
      v-if="auth.user"
      class="flex items-center gap-3 rounded-brand-lg border border-steel-200 bg-white p-4 dark:border-steel-800 dark:bg-steel-900/50"
    >
      <UAvatar :src="auth.user.avatarUrl ?? undefined" :alt="auth.displayName" size="lg" icon="i-lucide-user" />
      <div class="min-w-0">
        <p class="truncate font-medium">{{ auth.displayName }}</p>
        <p v-if="auth.user.email" class="truncate text-sm text-steel-500 dark:text-steel-400">{{ auth.user.email }}</p>
      </div>
    </div>

    <nav
      class="divide-y divide-steel-100 overflow-hidden rounded-brand-lg border border-steel-200 bg-white dark:divide-steel-800 dark:border-steel-800 dark:bg-steel-900/50"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-4 py-3.5 font-medium transition hover:bg-steel-50 dark:hover:bg-steel-800/50"
      >
        <UIcon :name="item.icon" class="size-5 text-brand-600 dark:text-brand-400" />
        <span class="flex-1">{{ item.label }}</span>
        <span
          v-if="item.badge > 0"
          class="min-w-5 rounded-full bg-brand-500 px-1.5 text-center text-xs font-semibold leading-5 text-white"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </span>
        <UIcon name="i-lucide-chevron-right" class="size-5 text-steel-300" />
      </NuxtLink>
    </nav>

    <AccountInstallApp />

    <UButton block size="lg" color="error" variant="soft" icon="i-lucide-log-out" :loading="loggingOut" @click="logout">
      {{ t('account.nav.logout') }}
    </UButton>
  </div>
</template>
