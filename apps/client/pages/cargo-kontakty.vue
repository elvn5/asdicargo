<script setup lang="ts">
import type { CompanyPoint, PublicSettings } from '~/types/api';

/**
 * «Контакты» в стиле референса: карточки способов связи, адреса и пункты
 * выдачи с картой, форма обратного звонка, юридическая информация.
 * Телефон, Telegram, e-mail и часы берутся из «Поддержки» в админке,
 * адреса — из «Адреса и пункты»; пока не заполнено — значения по умолчанию.
 */
const { t } = useI18n();
const config = useRuntimeConfig();

useSeoMeta({
  title: () => `${t('site.contactsPage.title')} — AsDi Cargo`,
  description: () => t('site.contactsPage.sub'),
  ogTitle: () => `${t('site.contactsPage.title')} — AsDi Cargo`,
  ogDescription: () => t('site.contactsPage.sub'),
});
const seoAlternates = useSeoAlternates();
useHead(() => ({ link: seoAlternates.value }));

const apiBase = (import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl) as string;

const { data: settings } = await useFetch<PublicSettings | null>(
  () => `${apiBase}/support/public`,
  {
    key: 'public-settings-contacts',
    default: () => null,
  },
);
const { data: points } = await useFetch<CompanyPoint[]>(() => `${apiBase}/addresses/public`, {
  key: 'public-points',
  default: () => [],
});

const DEFAULT_PHONE = '+996 552 165 165';
const DEFAULT_TELEGRAM = 'kalita_lida';
const DEFAULT_EMAIL = 'info@asdicargo.com';

const phone = computed(() => settings.value?.phone || DEFAULT_PHONE);
const phoneDigits = computed(() => phone.value.replace(/\D/g, ''));
const telegram = computed(() =>
  (settings.value?.telegramContact || DEFAULT_TELEGRAM).replace(/^@|^https?:\/\/t\.me\//, ''),
);
const email = computed(() => settings.value?.email || DEFAULT_EMAIL);
const hours = computed(() => settings.value?.workingHours || t('site.contactsPage.hoursValue'));

const channels = computed(() => [
  {
    key: 'phone',
    icon: 'i-lucide-phone',
    tone: 'bg-brand-500 text-white',
    label: t('site.contactsPage.phone'),
    value: phone.value,
    action: t('site.contactsPage.call'),
    href: `tel:+${phoneDigits.value}`,
    external: false,
  },
  {
    key: 'whatsapp',
    icon: 'i-lucide-message-circle',
    tone: 'bg-[#25D366] text-white',
    label: t('site.contactsPage.whatsapp'),
    value: phone.value,
    action: t('site.contactsPage.write'),
    href: `https://wa.me/${phoneDigits.value}`,
    external: true,
  },
  {
    key: 'telegram',
    icon: 'i-lucide-send',
    tone: 'bg-[#229ED9] text-white',
    label: t('site.contactsPage.telegram'),
    value: `@${telegram.value}`,
    action: t('site.contactsPage.write'),
    href: `https://t.me/${telegram.value}`,
    external: true,
  },
  {
    key: 'email',
    icon: 'i-lucide-mail',
    tone: 'bg-[#181818] text-white dark:bg-white dark:text-steel-950',
    label: t('site.contactsPage.email'),
    value: email.value,
    action: t('site.contactsPage.write'),
    href: `mailto:${email.value}`,
    external: false,
  },
]);
</script>

<template>
  <div class="space-y-2">
    <PageHero :title="t('site.contactsPage.title')" :subtitle="t('site.contactsPage.sub')">
      <p class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f0f4f9] px-4 py-2 text-sm font-semibold dark:bg-steel-800">
        <UIcon name="i-lucide-clock" class="size-4 text-brand-500" />
        {{ t('site.contactsPage.hours') }}: {{ hours }}
      </p>
    </PageHero>

    <!-- Способы связи -->
    <SitePanel tone="soft">
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <a
          v-for="c in channels"
          :key="c.key"
          :href="c.href"
          :target="c.external ? '_blank' : undefined"
          :rel="c.external ? 'noopener noreferrer' : undefined"
          class="group relative block"
        >
          <div class="site-card-white card-notch h-full p-6 pb-14">
            <span class="flex size-11 items-center justify-center rounded-full" :class="c.tone">
              <UIcon :name="c.icon" class="size-5" />
            </span>
            <p class="mt-5 text-sm text-steel-500 dark:text-steel-400">{{ c.label }}</p>
            <p class="mt-0.5 text-base font-bold [overflow-wrap:anywhere] xl:text-lg">{{ c.value }}</p>
            <p class="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">{{ c.action }}</p>
          </div>
          <span
            class="absolute bottom-1 right-1 flex size-11 items-center justify-center rounded-full bg-[#181818] text-white transition group-hover:bg-brand-500 dark:bg-white dark:text-steel-950"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-arrow-up-right" class="size-5" />
          </span>
        </a>
      </div>
    </SitePanel>

    <!-- Адреса и пункты выдачи -->
    <SitePanel :heading="t('site.contactsPage.pointsTitle')">
      <p class="-mt-4 mb-6 text-steel-600 dark:text-steel-300">{{ t('site.contactsPage.pointsSub') }}</p>
      <SitePointsDirectory v-if="points.length" :points="points" card-class="site-card" />
      <!-- Пока адреса не заведены в админке — главный офис из реквизитов -->
      <div v-else class="site-card flex items-start gap-4 p-6">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
          <UIcon name="i-lucide-building-2" class="size-5" />
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-steel-400">{{ t('site.contactsPage.office') }}</p>
          <p class="mt-1 text-lg font-bold">{{ t('footer.address') }}</p>
          <p class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ hours }}</p>
        </div>
      </div>
    </SitePanel>

    <!-- Обратный звонок + юридическая информация -->
    <SitePanel tone="soft">
      <div class="grid gap-2 lg:grid-cols-[1fr_22rem]">
        <SiteCallbackForm />
        <div class="site-card-white p-6">
          <h3 class="text-lg font-bold">{{ t('site.contactsPage.legalTitle') }}</h3>
          <p class="mt-3 font-semibold">{{ t('site.contactsPage.legalName') }}</p>
          <p class="mt-3 text-xs text-steel-500 dark:text-steel-400">{{ t('site.contactsPage.legalAddress') }}</p>
          <p class="text-sm">{{ t('footer.address') }}</p>
          <p class="mt-3 text-xs text-steel-500 dark:text-steel-400">{{ t('site.contactsPage.email') }}</p>
          <a :href="`mailto:${email}`" class="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">{{ email }}</a>
          <p class="mt-4 border-t border-steel-100 pt-3 text-xs text-steel-500 dark:border-steel-800 dark:text-steel-400">
            {{ t('site.contactsPage.legalNote') }}
          </p>
        </div>
      </div>
    </SitePanel>
  </div>
</template>
