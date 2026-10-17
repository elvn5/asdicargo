<script setup lang="ts">
import type { ShipmentRequest } from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const api = useApi();

const {
  data: requests,
  status,
  refresh,
} = await useAsyncData('account-requests', () => api.get<ShipmentRequest[]>('/account/requests'), {
  server: false,
  default: () => [],
});

const numberFmt = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'ru-RU'));

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'ru-RU');
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.requests.title') }}</h1>
      <UButton :to="localePath('/account/requests/new')" icon="i-lucide-plus">
        {{ t('account.requests.new') }}
      </UButton>
    </div>

    <div
      v-if="status === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="status === 'pending' || status === 'idle'" class="space-y-3">
      <USkeleton v-for="n in 3" :key="n" class="h-24 w-full rounded-brand-lg" />
    </div>

    <div v-else-if="requests.length" class="space-y-3">
      <NuxtLink
        v-for="r in requests"
        :key="r.id"
        :to="localePath(`/account/requests/${r.id}`)"
        class="group flex items-center gap-4 rounded-brand-lg border border-steel-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-brand-card dark:border-steel-800 dark:bg-steel-900/50 dark:hover:border-brand-700"
      >
        <div
          class="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex dark:bg-brand-950 dark:text-brand-400"
        >
          <UIcon name="i-lucide-clipboard-list" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold">{{ t('account.requests.number', { number: r.number }) }}</p>
          <p class="mt-0.5 truncate text-sm text-steel-500 dark:text-steel-400">
            {{ r.fromCity }} → {{ r.toCity }} · {{ r.cargoDescription }}
          </p>
        </div>
        <div class="flex shrink-0 flex-col items-end gap-1.5">
          <AccountRequestStatusBadge :status="r.status" />
          <span class="text-xs text-steel-400">
            ≈ {{ numberFmt.format(r.estimatedCostSom) }} {{ t('account.parcel.som') }} · {{ formatDate(r.createdAt) }}
          </span>
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 shrink-0 text-steel-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
        />
      </NuxtLink>
    </div>

    <div v-else class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700">
      <UIcon name="i-lucide-clipboard-list" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ t('account.requests.empty') }}</p>
      <p class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ t('account.requests.emptySub') }}</p>
      <UButton :to="localePath('/account/requests/new')" class="mt-4" size="sm" icon="i-lucide-plus">
        {{ t('account.requests.new') }}
      </UButton>
    </div>
  </div>
</template>
