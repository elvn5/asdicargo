<script setup lang="ts">
import { ApiError } from '~/composables/useApi';
import type { ShipmentRequest } from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const api = useApi();
const toast = useToast();

const id = computed(() => String(route.params.id));

const {
  data: request,
  status,
  error,
  refresh,
} = await useAsyncData(
  () => `account-request-${id.value}`,
  () => api.get<ShipmentRequest>(`/account/requests/${id.value}`),
  { server: false },
);

const notFound = computed(
  () => error.value?.cause instanceof ApiError && [400, 404].includes(error.value.cause.status),
);

const numberFmt = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'ru-RU'));

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const rows = computed(() => {
  const r = request.value;
  if (!r) return [];
  return [
    {
      label: t('account.requests.form.direction'),
      value: t(`account.requests.direction.${r.direction}`),
    },
    { label: t('account.requests.steps.route'), value: `${r.fromCity} → ${r.toCity}` },
    { label: t('account.requests.form.cargoDescription'), value: r.cargoDescription },
    { label: t('account.parcel.weight'), value: `${Number(r.weightKg)} ${t('account.parcel.kg')}` },
    {
      label: t('account.parcel.volume'),
      value: r.volumeM3 ? `${Number(r.volumeM3)} ${t('account.parcel.m3')}` : null,
    },
    {
      label: t('account.requests.steps.pickup'),
      value: r.pickupRequired ? r.pickupAddress : null,
    },
    {
      label: t('account.requests.steps.recipient'),
      value: `${r.recipientName}, ${r.recipientPhone}`,
    },
    { label: t('account.requests.form.recipientAddress'), value: r.recipientAddress },
    { label: t('account.requests.steps.comment'), value: r.comment },
    { label: t('account.requests.detail.created'), value: formatDateTime(r.createdAt) },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));
});

const cancelling = ref(false);

async function cancel(): Promise<void> {
  if (!request.value) return;
  if (!confirm(t('account.requests.detail.cancelConfirm', { number: request.value.number })))
    return;
  cancelling.value = true;
  try {
    request.value = await api.post<ShipmentRequest>(`/account/requests/${request.value.id}/cancel`);
    toast.add({
      title: t('account.requests.detail.cancelled'),
      color: 'neutral',
      icon: 'i-lucide-ban',
    });
  } catch {
    toast.add({ title: t('account.profile.errSave'), color: 'error' });
    await refresh();
  } finally {
    cancelling.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      :to="localePath('/account/requests')"
      class="inline-block text-sm font-medium text-steel-500 hover:text-brand-600 dark:text-steel-400"
    >
      {{ t('account.requests.detail.back') }}
    </NuxtLink>

    <div v-if="status === 'pending' || status === 'idle'" class="space-y-4">
      <USkeleton class="h-28 w-full rounded-brand-lg" />
      <USkeleton class="h-72 w-full rounded-brand-lg" />
    </div>

    <div
      v-else-if="status === 'error'"
      class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700"
    >
      <UIcon name="i-lucide-file-x" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ notFound ? t('account.requests.detail.notFound') : t('account.loadError') }}</p>
      <UButton v-if="!notFound" class="mt-3" size="sm" variant="soft" @click="refresh()">
        {{ t('account.retry') }}
      </UButton>
    </div>

    <template v-else-if="request">
      <section
        class="flex flex-wrap items-start justify-between gap-4 rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50"
      >
        <div>
          <h1 class="text-2xl font-bold">{{ t('account.requests.number', { number: request.number }) }}</h1>
          <p class="mt-1 text-steel-500 dark:text-steel-400">{{ request.fromCity }} → {{ request.toCity }}</p>
          <p v-if="request.status === 'new'" class="mt-3 text-sm text-steel-500 dark:text-steel-400">
            {{ t('account.requests.detail.waiting') }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <AccountRequestStatusBadge :status="request.status" />
          <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('account.requests.detail.estimate') }}</p>
          <p class="text-2xl font-bold text-brand-gradient">
            ≈ {{ numberFmt.format(request.estimatedCostSom) }} {{ t('account.parcel.som') }}
          </p>
        </div>
      </section>

      <!-- Ответ менеджера / созданная посылка -->
      <div
        v-if="request.managerComment || request.parcelId"
        class="space-y-3 rounded-brand-lg border border-brand-100 bg-brand-gradient-soft p-5 dark:border-steel-800"
      >
        <div v-if="request.managerComment">
          <p class="text-sm font-medium text-steel-500 dark:text-steel-400">{{ t('account.requests.detail.managerComment') }}</p>
          <p class="mt-1 whitespace-pre-line">{{ request.managerComment }}</p>
        </div>
        <div v-if="request.parcelId" class="flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <UIcon name="i-lucide-package-check" class="size-4" />
            {{ t('account.requests.detail.parcel') }}
          </span>
          <UButton :to="localePath(`/account/parcels/${request.parcelId}`)" size="sm" variant="soft" trailing-icon="i-lucide-arrow-right">
            {{ t('account.requests.detail.openParcel') }}
          </UButton>
        </div>
      </div>

      <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
        <dl class="divide-y divide-steel-100 dark:divide-steel-800">
          <div v-for="row in rows" :key="row.label" class="grid gap-1 py-3 text-sm first:pt-0 last:pb-0 sm:grid-cols-[14rem_1fr] sm:gap-4">
            <dt class="text-steel-500 dark:text-steel-400">{{ row.label }}</dt>
            <dd class="whitespace-pre-line font-medium">{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <UButton
        v-if="request.status === 'new'"
        color="error"
        variant="soft"
        icon="i-lucide-ban"
        :loading="cancelling"
        @click="cancel"
      >
        {{ t('account.requests.detail.cancel') }}
      </UButton>
    </template>
  </div>
</template>
