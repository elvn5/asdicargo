<script setup lang="ts">
import type { AccountNotification } from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useApi();
const { describe, refreshUnread } = useNotifications();

const {
  data: items,
  status,
  refresh,
} = await useAsyncData(
  'account-notifications',
  () => api.get<AccountNotification[]>('/account/notifications'),
  { server: false, default: () => [] },
);

const hasUnread = computed(() => items.value.some((n) => !n.readAt));

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function open(n: AccountNotification): Promise<void> {
  if (!n.readAt) {
    n.readAt = new Date().toISOString();
    api.post(`/account/notifications/${n.id}/read`).then(refreshUnread, () => undefined);
  }
  if (n.link) await navigateTo(localePath(n.link));
}

async function readAll(): Promise<void> {
  await api.post('/account/notifications/read-all');
  await Promise.all([refresh(), refreshUnread()]);
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.notifications.title') }}</h1>
      <UButton v-if="hasUnread" color="neutral" variant="soft" icon="i-lucide-check-check" @click="readAll">
        {{ t('account.notifications.readAll') }}
      </UButton>
    </div>

    <div
      v-if="status === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="status === 'pending' || status === 'idle'" class="space-y-2">
      <USkeleton v-for="n in 4" :key="n" class="h-16 w-full rounded-brand-lg" />
    </div>

    <ul
      v-else-if="items.length"
      class="divide-y divide-steel-100 overflow-hidden rounded-brand-lg border border-steel-200 bg-white dark:divide-steel-800 dark:border-steel-800 dark:bg-steel-900/50"
    >
      <li v-for="n in items" :key="n.id">
        <button
          type="button"
          class="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-steel-50 dark:hover:bg-steel-800/50"
          :class="n.readAt ? '' : 'bg-brand-50/60 dark:bg-brand-950/30'"
          @click="open(n)"
        >
          <div
            class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
            :class="n.readAt ? 'bg-steel-100 text-steel-500 dark:bg-steel-800' : 'bg-brand-500 text-white'"
          >
            <UIcon :name="NOTIFICATION_ICON[n.type]" class="size-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm" :class="n.readAt ? 'font-medium' : 'font-semibold'">{{ describe(n).title }}</p>
            <p class="mt-0.5 text-sm text-steel-600 dark:text-steel-300">{{ describe(n).body }}</p>
          </div>
          <span class="shrink-0 text-xs text-steel-400">{{ formatDateTime(n.createdAt) }}</span>
        </button>
      </li>
    </ul>

    <div v-else class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700">
      <UIcon name="i-lucide-bell" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ t('account.notifications.empty') }}</p>
      <p class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ t('account.notifications.emptySub') }}</p>
    </div>
  </div>
</template>
