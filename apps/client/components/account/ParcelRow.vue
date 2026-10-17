<script setup lang="ts">
import type { MyParcel } from '~/types/api';

defineProps<{ parcel: MyParcel }>();
const { t, locale } = useI18n();
const localePath = useLocalePath();

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'ru-RU');
}
</script>

<template>
  <NuxtLink
    :to="localePath(`/account/parcels/${parcel.id}`)"
    class="group flex items-center gap-4 rounded-brand-lg border border-steel-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-brand-card dark:border-steel-800 dark:bg-steel-900/50 dark:hover:border-brand-700"
  >
    <div
      class="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:flex dark:bg-brand-950 dark:text-brand-400"
    >
      <UIcon :name="PARCEL_STATUS_META[parcel.status].icon" class="size-5" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate font-mono text-sm font-semibold">{{ parcel.trackNumber }}</p>
      <p class="mt-0.5 truncate text-sm text-steel-500 dark:text-steel-400">
        {{ parcel.description || formatDate(parcel.createdAt) }}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-1.5">
      <AccountParcelStatusBadge :status="parcel.status" />
      <span class="text-xs text-steel-400">
        <template v-if="parcel.weightKg">{{ parcel.weightKg }} {{ t('account.parcel.kg') }} · </template>{{ formatDate(parcel.updatedAt) }}
      </span>
    </div>
    <UIcon
      name="i-lucide-chevron-right"
      class="size-5 shrink-0 text-steel-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
    />
  </NuxtLink>
</template>
