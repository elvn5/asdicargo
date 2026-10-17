<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import type { MyParcel, ParcelSummary, PublicSettings } from '~/types/api';

const { t } = useI18n();
const localePath = useLocalePath();
const auth = useAuthStore();
const { unread } = useNotifications();
const api = useApi();

// Номер по умолчанию, пока в админке не задан телефон поддержки.
const DEFAULT_WHATSAPP_PHONE = '996552165165';

// Сессия живёт в cookie браузера — данные кабинета грузим только на клиенте.
const { data, status, refresh } = await useAsyncData(
  'account-dashboard',
  async () => {
    const [summary, parcels] = await Promise.all([
      api.get<ParcelSummary>('/account/parcels/summary'),
      api.get<MyParcel[]>('/account/parcels'),
    ]);
    return { summary, recent: parcels.slice(0, 5) };
  },
  { server: false },
);

const { data: support } = await useAsyncData(
  'account-support',
  () => api.get<PublicSettings>('/support/public'),
  { server: false },
);

const cards = computed(() => {
  const s = data.value?.summary;
  const by = s?.byStatus;
  return [
    {
      key: 'total',
      value: s?.total ?? 0,
      icon: 'i-lucide-package',
      tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400',
    },
    {
      key: 'active',
      value: by ? by.created + by.in_transit + by.arrived : 0,
      icon: 'i-lucide-truck',
      tone: 'text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400',
    },
    {
      key: 'ready',
      value: by?.ready_for_pickup ?? 0,
      icon: 'i-lucide-package-check',
      tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      key: 'issued',
      value: by?.issued ?? 0,
      icon: 'i-lucide-circle-check',
      tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
    },
  ];
});

const firstName = computed(() => auth.user?.firstName || auth.displayName);

const whatsappUrl = computed(() => {
  const digits = (support.value?.phone ?? '').replace(/\D/g, '') || DEFAULT_WHATSAPP_PHONE;
  return `https://api.whatsapp.com/send/?phone=${digits}&type=phone_number&app_absent=0`;
});

const telegramUrl = computed(() => {
  const raw = support.value?.telegramContact?.trim();
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;
  return `https://t.me/${raw.replace(/^@/, '')}`;
});
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.greeting', { name: firstName }) }}</h1>
        <p class="mt-1 text-steel-500 dark:text-steel-400">{{ t('account.greetingSub') }}</p>
      </div>
      <UButton :to="localePath('/account/requests/new')" icon="i-lucide-plus" size="lg" class="hidden sm:inline-flex lg:hidden">
        {{ t('account.nav.newRequest') }}
      </UButton>
    </header>

    <NuxtLink
      v-if="unread > 0"
      :to="localePath('/account/notifications')"
      class="flex items-center gap-3 rounded-brand-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 transition hover:border-brand-300 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-200"
    >
      <UIcon name="i-lucide-bell-ring" class="size-5 shrink-0" />
      <span class="flex-1">{{ t('account.notifications.newCount', { count: unread }) }}</span>
      <span class="text-brand-600 dark:text-brand-400">{{ t('account.notifications.show') }} →</span>
    </NuxtLink>

    <div v-if="status === 'error'" class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <!-- Сводка по статусам -->
    <section class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.key"
        class="rounded-brand-lg border border-steel-200 bg-white p-4 sm:p-5 dark:border-steel-800 dark:bg-steel-900/50"
      >
        <div class="flex size-10 items-center justify-center rounded-xl" :class="card.tone">
          <UIcon :name="card.icon" class="size-5" />
        </div>
        <USkeleton v-if="status === 'pending' || status === 'idle'" class="mt-4 h-8 w-12" />
        <p v-else class="mt-4 text-3xl font-bold tabular-nums">{{ card.value }}</p>
        <p class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ t(`account.summary.${card.key}`) }}</p>
      </div>
    </section>

    <!-- Расчёт перевозки — сразу ведёт в заявку -->
    <ShippingSearch initial-from="Бишкек" />

    <div class="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <!-- Последние посылки -->
      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ t('account.recent') }}</h2>
          <NuxtLink
            v-if="data?.recent.length"
            :to="localePath('/account/parcels')"
            class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {{ t('account.viewAll') }} →
          </NuxtLink>
        </div>

        <div v-if="status === 'pending' || status === 'idle'" class="space-y-3">
          <USkeleton v-for="n in 3" :key="n" class="h-20 w-full rounded-brand-lg" />
        </div>
        <div v-else-if="data?.recent.length" class="space-y-3">
          <AccountParcelRow v-for="p in data.recent" :key="p.id" :parcel="p" />
        </div>
        <div
          v-else-if="status === 'success'"
          class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700"
        >
          <UIcon name="i-lucide-package-open" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
          <p class="mt-3 font-medium">{{ t('account.empty') }}</p>
          <p class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ t('account.emptySub') }}</p>
        </div>
      </section>

      <aside class="space-y-4">
        <!-- Менеджер -->
        <div class="rounded-brand-lg bg-brand-steel-gradient p-5 text-white shadow-brand-card">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-full bg-white/15">
              <UIcon name="i-lucide-headset" class="size-6" />
            </div>
            <div>
              <p class="font-semibold">{{ t('account.manager.title') }}</p>
              <p class="text-sm text-white/75">{{ t('account.manager.sub') }}</p>
            </div>
          </div>
          <p v-if="support?.workingHours" class="mt-4 text-sm text-white/80">
            <span class="text-white/60">{{ t('account.manager.hours') }}:</span> {{ support.workingHours }}
          </p>
          <div class="mt-4 flex flex-col gap-2">
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-white/90"
            >
              <UIcon name="i-lucide-message-circle" class="size-4" />
              {{ t('account.manager.whatsapp') }}
            </a>
            <a
              v-if="telegramUrl"
              :href="telegramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <UIcon name="i-lucide-send" class="size-4" />
              {{ t('account.manager.telegram') }}
            </a>
          </div>
        </div>

        <AccountInstallApp />
      </aside>
    </div>
  </div>
</template>
