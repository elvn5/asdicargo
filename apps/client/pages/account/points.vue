<script setup lang="ts">
import type { AddressKind, CompanyPoint } from '~/types/api';

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

const KINDS: Array<AddressKind | 'all'> = ['all', 'pickup', 'warehouse', 'office'];
const kind = ref<AddressKind | 'all'>('all');
const selectedId = ref<string | null>(null);

// Показываем только те типы, которые реально есть в данных.
const availableKinds = computed(() =>
  KINDS.filter((k) => k === 'all' || points.value.some((p) => p.kind === k)),
);

const filtered = computed(() =>
  kind.value === 'all' ? points.value : points.value.filter((p) => p.kind === kind.value),
);

const hasMap = computed(() =>
  points.value.some((p) => p.latitude !== null && p.longitude !== null),
);

function select(id: string): void {
  selectedId.value = id;
  // На мобильных карта над списком — прокручиваем к выбранной карточке.
  document.getElementById(`point-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
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

    <template v-else>
      <div v-if="availableKinds.length > 2" class="flex flex-wrap gap-2">
        <button
          v-for="k in availableKinds"
          :key="k"
          type="button"
          class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
          :class="
            kind === k
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-steel-200 bg-white text-steel-600 hover:border-brand-300 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-300'
          "
          @click="kind = k"
        >
          {{ k === 'all' ? t('account.points.all') : t(`account.points.kind.${k}`) }}
        </button>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div
          v-if="hasMap"
          class="h-72 overflow-hidden rounded-brand-lg border border-steel-200 sm:h-96 xl:sticky xl:top-28 xl:h-[32rem] dark:border-steel-800"
        >
          <AccountPointsMap :points="filtered" :selected-id="selectedId" @select="select" />
        </div>

        <ul class="space-y-3" :class="hasMap ? '' : 'xl:col-span-2'">
          <li
            v-for="p in filtered"
            :id="`point-${p.id}`"
            :key="p.id"
            class="cursor-pointer rounded-brand-lg border bg-white p-4 transition dark:bg-steel-900/50"
            :class="
              selectedId === p.id
                ? 'border-brand-400 shadow-brand-card dark:border-brand-700'
                : 'border-steel-200 hover:border-brand-300 dark:border-steel-800'
            "
            @click="selectedId = p.id"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
              >
                <UIcon :name="POINT_KIND_ICON[p.kind]" class="size-5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium uppercase tracking-wide text-steel-400">
                  {{ t(`account.points.kind.${p.kind}`) }}<template v-if="p.city"> · {{ p.city }}</template>
                </p>
                <p class="mt-0.5 font-semibold">{{ p.title }}</p>
                <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ p.fullAddress }}</p>
                <p v-if="p.workingHours" class="mt-1 flex items-center gap-1.5 text-sm text-steel-500 dark:text-steel-400">
                  <UIcon name="i-lucide-clock" class="size-4 shrink-0" />
                  {{ p.workingHours }}
                </p>
                <p v-if="p.comment" class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ p.comment }}</p>
                <p v-if="hasMap && (p.latitude === null || p.longitude === null)" class="mt-1 text-xs text-steel-400">
                  {{ t('account.points.noMap') }}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <UButton
                    :to="pointMapUrl(p)"
                    target="_blank"
                    size="xs"
                    variant="soft"
                    icon="i-lucide-navigation"
                    @click.stop
                  >
                    {{ t('account.points.route') }}
                  </UButton>
                  <UButton
                    v-if="p.phone"
                    :to="phoneHref(p.phone)"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-phone"
                    @click.stop
                  >
                    {{ p.phone }}
                  </UButton>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
