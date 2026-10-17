<script setup lang="ts">
import { ApiError } from '~/composables/useApi';
import type { MyParcel, ParcelStatus } from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const api = useApi();

const id = computed(() => String(route.params.id));

const {
  data: parcel,
  status,
  error,
  refresh,
} = await useAsyncData(
  () => `account-parcel-${id.value}`,
  () => api.get<MyParcel>(`/account/parcels/${id.value}`),
  { server: false },
);

const notFound = computed(
  () => error.value?.cause instanceof ApiError && [400, 404].includes(error.value.cause.status),
);

const dateLocale = computed(() => (locale.value === 'en' ? 'en-GB' : 'ru-RU'));

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(dateLocale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(dateLocale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Прогресс: индекс текущего статуса на пути посылки.
const currentStep = computed(() =>
  parcel.value ? PARCEL_STATUS_STEPS.indexOf(parcel.value.status) : -1,
);

// Последняя дата достижения каждого шага — из истории статусов.
const reachedAt = computed(() => {
  const map = new Map<ParcelStatus, string>();
  for (const item of parcel.value?.history ?? []) map.set(item.status, item.createdAt);
  return map;
});

const historyDesc = computed(() => [...(parcel.value?.history ?? [])].reverse());

const details = computed(() => {
  const p = parcel.value;
  if (!p) return [];
  return [
    {
      label: t('account.parcel.weight'),
      value: p.weightKg ? `${p.weightKg} ${t('account.parcel.kg')}` : null,
    },
    {
      label: t('account.parcel.volume'),
      value: p.volumeM3 ? `${p.volumeM3} ${t('account.parcel.m3')}` : null,
    },
    {
      label: t('account.parcel.cost'),
      value: p.costSom ? `${p.costSom} ${t('account.parcel.som')}` : null,
    },
    { label: t('account.parcel.created'), value: formatDate(p.createdAt) },
    { label: t('account.parcel.updated'), value: formatDate(p.updatedAt) },
  ].filter((d): d is { label: string; value: string } => Boolean(d.value));
});

const { copy, copied } = useClipboard({ legacy: true });
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      :to="localePath('/account/parcels')"
      class="inline-block text-sm font-medium text-steel-500 hover:text-brand-600 dark:text-steel-400"
    >
      {{ t('account.parcel.back') }}
    </NuxtLink>

    <div v-if="status === 'pending' || status === 'idle'" class="space-y-4">
      <USkeleton class="h-32 w-full rounded-brand-lg" />
      <USkeleton class="h-64 w-full rounded-brand-lg" />
    </div>

    <div
      v-else-if="status === 'error'"
      class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700"
    >
      <UIcon name="i-lucide-package-x" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ notFound ? t('account.parcel.notFound') : t('account.loadError') }}</p>
      <UButton v-if="!notFound" class="mt-3" size="sm" variant="soft" @click="refresh()">
        {{ t('account.retry') }}
      </UButton>
    </div>

    <template v-else-if="parcel">
      <!-- Шапка посылки -->
      <section
        class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('account.parcel.track') }}</p>
            <div class="mt-1 flex items-center gap-2">
              <h1 class="truncate font-mono text-xl font-bold sm:text-2xl">{{ parcel.trackNumber }}</h1>
              <UTooltip :text="copied ? t('account.parcel.copied') : t('account.parcel.copy')">
                <UButton
                  :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="t('account.parcel.copy')"
                  @click="copy(parcel.trackNumber)"
                />
              </UTooltip>
            </div>
            <p v-if="parcel.description" class="mt-1 text-steel-600 dark:text-steel-300">{{ parcel.description }}</p>
          </div>
          <AccountParcelStatusBadge :status="parcel.status" />
        </div>

        <!-- Прогресс по шагам -->
        <div v-if="parcel.status === 'cancelled'" class="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {{ t('account.parcel.cancelled') }}
        </div>
        <ol v-else class="mt-8 grid grid-cols-5 gap-1">
          <li v-for="(step, i) in PARCEL_STATUS_STEPS" :key="step" class="flex flex-col items-center text-center">
            <div class="flex w-full items-center">
              <div class="h-0.5 flex-1" :class="i === 0 ? 'opacity-0' : i <= currentStep ? 'bg-brand-500' : 'bg-steel-200 dark:bg-steel-700'" />
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white transition dark:ring-steel-900"
                :class="
                  i < currentStep
                    ? 'bg-brand-500 text-white'
                    : i === currentStep
                      ? 'bg-brand-gradient text-white shadow-lg shadow-brand-500/30'
                      : 'bg-steel-100 text-steel-400 dark:bg-steel-800'
                "
              >
                <UIcon :name="i < currentStep ? 'i-lucide-check' : PARCEL_STATUS_META[step].icon" class="size-4" />
              </div>
              <div
                class="h-0.5 flex-1"
                :class="i === PARCEL_STATUS_STEPS.length - 1 ? 'opacity-0' : i < currentStep ? 'bg-brand-500' : 'bg-steel-200 dark:bg-steel-700'"
              />
            </div>
            <p
              class="mt-2 text-[11px] font-medium leading-tight sm:text-xs"
              :class="i <= currentStep ? 'text-steel-800 dark:text-steel-100' : 'text-steel-400'"
            >
              {{ t(`account.status.${step}`) }}
            </p>
            <p v-if="i <= currentStep && reachedAt.get(step)" class="mt-0.5 hidden text-[11px] text-steel-400 sm:block">
              {{ formatDateTime(reachedAt.get(step)!) }}
            </p>
          </li>
        </ol>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Детали -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <dl class="divide-y divide-steel-100 dark:divide-steel-800">
            <div v-for="d in details" :key="d.label" class="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
              <dt class="text-steel-500 dark:text-steel-400">{{ d.label }}</dt>
              <dd class="text-right font-medium">{{ d.value }}</dd>
            </div>
          </dl>
          <div v-if="parcel.comment" class="mt-5 rounded-xl bg-steel-50 p-4 text-sm dark:bg-steel-800/50">
            <p class="mb-1 font-medium text-steel-500 dark:text-steel-400">{{ t('account.parcel.comment') }}</p>
            <p class="whitespace-pre-line">{{ parcel.comment }}</p>
          </div>
        </section>

        <!-- История -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <h2 class="mb-4 font-semibold">{{ t('account.parcel.history') }}</h2>
          <ol class="relative space-y-5 border-l border-steel-200 pl-6 dark:border-steel-700">
            <li v-for="(item, i) in historyDesc" :key="item.id" class="relative">
              <span
                class="absolute -left-[31px] top-0.5 flex size-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-steel-900"
                :class="i === 0 ? 'bg-brand-500' : 'bg-steel-300 dark:bg-steel-600'"
              />
              <p class="text-sm font-medium" :class="i === 0 ? '' : 'text-steel-600 dark:text-steel-300'">
                {{ t(`account.status.${item.status}`) }}
              </p>
              <p class="text-xs text-steel-400">{{ formatDateTime(item.createdAt) }}</p>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </div>
</template>
