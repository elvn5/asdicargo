<script setup lang="ts">
import type { CompanyPoint } from '~/types/api';

const { t } = useI18n();
const api = useApi();

const {
  data: points,
  status,
  refresh,
} = await useAsyncData('account-points', () => api.get<CompanyPoint[]>('/addresses/public'), {
  server: false,
  default: () => [],
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.points.title') }}</h1>
      <p class="mt-1 text-steel-500 dark:text-steel-400">{{ t('account.points.sub') }}</p>
    </div>

    <div
      v-if="status === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="status === 'pending' || status === 'idle'" class="space-y-4">
      <USkeleton class="h-72 w-full rounded-brand-lg" />
      <USkeleton v-for="n in 2" :key="n" class="h-24 w-full rounded-brand-lg" />
    </div>

    <div
      v-else-if="!points.length"
      class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700"
    >
      <UIcon name="i-lucide-map-pin-off" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ t('account.points.empty') }}</p>
    </div>

    <SitePointsDirectory v-else :points="points" />
  </div>
</template>
