<script setup lang="ts">
import type { ParcelStatus } from '~/types/api';

/** «Отследите груз»: публичный поиск посылки по трек-номеру. */
interface PublicTracking {
  trackNumber: string;
  status: ParcelStatus;
  updatedAt: string;
  history: Array<{ status: ParcelStatus; createdAt: string }>;
}

const { t, locale } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();

const query = ref('');
const loading = ref(false);
const result = ref<PublicTracking | null>(null);
const error = ref<string | null>(null);

function formatDate(value: string): string {
  return new Date(value).toLocaleString(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function search(): Promise<void> {
  const track = query.value.trim();
  if (!track) return;
  loading.value = true;
  error.value = null;
  result.value = null;
  try {
    result.value = await $fetch<PublicTracking>(
      `${config.public.apiBaseUrl}/parcels/track/${encodeURIComponent(track)}`,
    );
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    error.value = status === 404 ? t('site.tracking.notFound') : t('site.tracking.error');
  } finally {
    loading.value = false;
  }
}

const currentStep = computed(() =>
  result.value ? PARCEL_STATUS_STEPS.indexOf(result.value.status) : -1,
);
</script>

<template>
  <div id="tracking" class="site-card scroll-mt-32 p-5 sm:p-6">
    <h3 class="text-lg font-bold">{{ t('site.tracking.title') }}</h3>
    <form class="mt-4 flex gap-2" @submit.prevent="search">
      <input
        v-model="query"
        type="text"
        :placeholder="t('site.tracking.placeholder')"
        :aria-label="t('site.tracking.title')"
        maxlength="64"
        class="min-w-0 flex-1 rounded-[0.9375rem] bg-white px-4 py-3 text-sm outline-none ring-brand-300 placeholder:text-steel-400 focus:ring-2 dark:bg-steel-900"
      />
      <button
        type="submit"
        class="btn-ink !min-h-0 !px-0 size-12 shrink-0"
        :aria-label="t('site.tracking.search')"
        :disabled="loading"
      >
        <UIcon :name="loading ? 'i-lucide-loader-circle' : 'i-lucide-search'" class="size-5" :class="loading ? 'animate-spin' : ''" />
      </button>
    </form>

    <p v-if="error" class="mt-3 text-sm text-red-600 dark:text-red-400">{{ error }}</p>

    <div v-if="result" class="mt-4 rounded-2xl bg-white p-4 dark:bg-steel-900">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-mono text-sm font-bold">{{ result.trackNumber }}</p>
        <AccountParcelStatusBadge :status="result.status" />
      </div>
      <!-- Прогресс по шагам -->
      <div v-if="result.status !== 'cancelled'" class="mt-4 flex items-center gap-1">
        <span
          v-for="(step, i) in PARCEL_STATUS_STEPS"
          :key="step"
          class="h-1.5 flex-1 rounded-full"
          :class="i <= currentStep ? 'bg-brand-500' : 'bg-steel-200 dark:bg-steel-700'"
        />
      </div>
      <p class="mt-3 text-xs text-steel-500">{{ t('site.tracking.updated', { date: formatDate(result.updatedAt) }) }}</p>
      <NuxtLink :to="localePath('/account/parcels')" class="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
        {{ t('site.tracking.account') }} →
      </NuxtLink>
    </div>
  </div>
</template>
