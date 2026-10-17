<script setup lang="ts">
import type { Appeal } from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useApi();

const {
  data: appeals,
  status,
  refresh,
} = await useAsyncData('account-appeals', () => api.get<Appeal[]>('/account/appeals'), {
  server: false,
  default: () => [],
});

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'ru-RU');
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.appeals.title') }}</h1>
        <p class="mt-1 text-steel-500 dark:text-steel-400">{{ t('account.appeals.sub') }}</p>
      </div>
      <UButton :to="localePath('/account/appeals/new')" icon="i-lucide-plus">{{ t('account.appeals.new') }}</UButton>
    </div>

    <div
      v-if="status === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="status === 'pending' || status === 'idle'" class="space-y-3">
      <USkeleton v-for="n in 3" :key="n" class="h-20 w-full rounded-brand-lg" />
    </div>

    <div v-else-if="appeals.length" class="space-y-3">
      <NuxtLink
        v-for="a in appeals"
        :key="a.id"
        :to="localePath(`/account/appeals/${a.id}`)"
        class="group flex items-center gap-4 rounded-brand-lg border border-steel-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-brand-card dark:border-steel-800 dark:bg-steel-900/50 dark:hover:border-brand-700"
      >
        <div
          class="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex dark:bg-brand-950 dark:text-brand-400"
        >
          <UIcon name="i-lucide-message-square-warning" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold">{{ a.subject }}</p>
          <p class="mt-0.5 truncate text-sm text-steel-500 dark:text-steel-400">
            {{ t('account.appeals.number', { number: a.number }) }} · {{ t(`account.appeals.category.${a.category}`)
            }}<template v-if="a.parcel"> · {{ a.parcel.trackNumber }}</template>
          </p>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-1.5">
          <UBadge
            :color="APPEAL_STATUS_META[a.status].color"
            :icon="APPEAL_STATUS_META[a.status].icon"
            variant="subtle"
            class="rounded-full"
          >
            {{ t(`account.appeals.status.${a.status}`) }}
          </UBadge>
          <span class="text-xs text-steel-400">{{ formatDate(a.lastMessageAt) }}</span>
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 shrink-0 text-steel-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
        />
      </NuxtLink>
    </div>

    <div v-else class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700">
      <UIcon name="i-lucide-message-square" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ t('account.appeals.empty') }}</p>
      <p class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ t('account.appeals.emptySub') }}</p>
      <UButton :to="localePath('/account/appeals/new')" class="mt-4" size="sm" icon="i-lucide-plus">
        {{ t('account.appeals.new') }}
      </UButton>
    </div>
  </div>
</template>
