<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

// Раздел «Ещё» для мобильного нижнего меню: всё, что не поместилось во вкладки.
const { t } = useI18n();
const localePath = useLocalePath();
const auth = useAuthStore();
const { loggingOut, logout } = useLogout();

const items = computed(() => [
  {
    to: localePath('/account/requests'),
    label: t('account.nav.requests'),
    icon: 'i-lucide-clipboard-list',
  },
  {
    to: localePath('/account/addresses'),
    label: t('account.nav.addresses'),
    icon: 'i-lucide-book-user',
  },
  {
    to: localePath('/account/profile'),
    label: t('account.nav.profile'),
    icon: 'i-lucide-user-round',
  },
  {
    to: localePath('/cargo-kalkulyator'),
    label: t('account.nav.calculator'),
    icon: 'i-lucide-calculator',
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
        <UIcon name="i-lucide-chevron-right" class="size-5 text-steel-300" />
      </NuxtLink>
    </nav>

    <UButton block size="lg" color="error" variant="soft" icon="i-lucide-log-out" :loading="loggingOut" @click="logout">
      {{ t('account.nav.logout') }}
    </UButton>
  </div>
</template>
