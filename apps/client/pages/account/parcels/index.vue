<script setup lang="ts">
import type { MyParcel, ParcelStatus } from '~/types/api';

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

const STATUS_FILTERS: Array<ParcelStatus | 'all'> = ['all', ...PARCEL_STATUS_STEPS, 'cancelled'];

// Фильтры синхронизируются с query-строкой, чтобы ссылкой можно было поделиться.
const initialStatus = String(route.query.status ?? 'all') as ParcelStatus | 'all';
const status = ref<ParcelStatus | 'all'>(
  STATUS_FILTERS.includes(initialStatus) ? initialStatus : 'all',
);
const search = ref(typeof route.query.q === 'string' ? route.query.q : '');
const debouncedSearch = refDebounced(search, 350);
const from = ref(typeof route.query.from === 'string' ? route.query.from : '');
const to = ref(typeof route.query.to === 'string' ? route.query.to : '');

const query = computed(() => {
  const q: Record<string, string> = {};
  if (status.value !== 'all') q.status = status.value;
  if (debouncedSearch.value.trim()) q.q = debouncedSearch.value.trim();
  if (from.value) q.from = from.value;
  if (to.value) q.to = to.value;
  return q;
});

const hasFilters = computed(() => Object.keys(query.value).length > 0);

watch(query, (q) => router.replace({ query: q }));

const {
  data: parcels,
  status: loadStatus,
  refresh,
} = await useAsyncData(
  'account-parcels',
  () => api.get<MyParcel[]>(`/account/parcels?${new URLSearchParams(query.value).toString()}`),
  { server: false, watch: [query], default: () => [] },
);

function resetFilters(): void {
  status.value = 'all';
  search.value = '';
  from.value = '';
  to.value = '';
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.nav.parcels') }}</h1>

    <!-- Фильтры -->
    <div class="space-y-3">
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          v-for="s in STATUS_FILTERS"
          :key="s"
          type="button"
          class="shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
          :class="
            status === s
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-steel-200 bg-white text-steel-600 hover:border-brand-300 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-300'
          "
          @click="status = s"
        >
          {{ s === 'all' ? t('account.filters.all') : t(`account.status.${s}`) }}
        </button>
      </div>

      <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('account.filters.search')"
          size="lg"
          class="w-full"
        />
        <UInput v-model="from" type="date" size="lg" :aria-label="t('account.filters.from')" :max="to || undefined" />
        <UInput v-model="to" type="date" size="lg" :aria-label="t('account.filters.to')" :min="from || undefined" />
        <UButton
          v-if="hasFilters"
          color="neutral"
          variant="ghost"
          size="lg"
          icon="i-lucide-x"
          @click="resetFilters"
        >
          {{ t('account.filters.reset') }}
        </UButton>
      </div>
    </div>

    <div
      v-if="loadStatus === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="loadStatus === 'pending' || loadStatus === 'idle'" class="space-y-3">
      <USkeleton v-for="n in 4" :key="n" class="h-20 w-full rounded-brand-lg" />
    </div>

    <div v-else-if="parcels.length" class="space-y-3">
      <AccountParcelRow v-for="p in parcels" :key="p.id" :parcel="p" />
    </div>

    <div
      v-else
      class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700"
    >
      <UIcon
        :name="hasFilters ? 'i-lucide-search-x' : 'i-lucide-package-open'"
        class="mx-auto size-10 text-steel-300 dark:text-steel-600"
      />
      <p class="mt-3 font-medium">{{ hasFilters ? t('account.filters.notFound') : t('account.empty') }}</p>
      <p v-if="!hasFilters" class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ t('account.emptySub') }}</p>
    </div>
  </div>
</template>
