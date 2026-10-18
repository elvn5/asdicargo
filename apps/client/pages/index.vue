<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();

// Дефолт для кнопки «Бесплатная консультация», пока админ не задал свою ссылку.
const WHATSAPP_CONSULTATION_URL =
  'https://api.whatsapp.com/send/?phone=996552165165&text&type=phone_number&app_absent=0';

useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
});

// hreflang для всех локалей главной
const seoAlternates = useSeoAlternates();
useHead(() => ({ link: seoAlternates.value }));

// Редактируемая через админку ссылка «Бесплатная консультация».
// Тянем публичные настройки; при ошибке/пустом значении — WhatsApp по умолчанию.
const apiBase = (import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl) as string;
const { data: settings } = await useFetch<{ consultationUrl: string | null }>(
  () => `${apiBase}/support/public`,
  { key: 'public-settings', server: true, default: () => null },
);
const consultationUrl = computed(
  () => settings.value?.consultationUrl || WHATSAPP_CONSULTATION_URL,
);

// Услуги (иконочные карточки).
const services = [
  { key: 'storage', icon: 'i-lucide-warehouse' },
  { key: 'delivery', icon: 'i-lucide-truck' },
  { key: 'documents', icon: 'i-lucide-file-text' },
] as const;

// Статистика «в цифрах» — редактируется через админку; фолбэк на i18n, если API недоступен/пусто.
const fallbackStats = computed(() => [
  { value: t('stats.n1v'), label: t('stats.n1l') },
  { value: t('stats.n2v'), label: t('stats.n2l') },
  { value: t('stats.n3v'), label: t('stats.n3l') },
  { value: t('stats.n4v'), label: t('stats.n4l') },
]);

const { data: homeStats } = await useFetch<Array<{ value: string; label: string }>>(
  () => `${apiBase}/home-stats/public?language=${locale.value}`,
  { key: () => `home-stats-${locale.value}`, server: true, default: () => [] },
);
const stats = computed(() =>
  homeStats.value && homeStats.value.length > 0 ? homeStats.value : fallbackStats.value,
);

// Блок «Почему выбирают нас» — карточки с кнопкой-стрелкой в «вырезе» угла.
const features = computed(() => [
  { key: 'f1', icon: 'i-lucide-award', to: localePath('/cargo-o-nas') },
  { key: 'f2', icon: 'i-lucide-calculator', to: localePath('/cargo-kalkulyator') },
  { key: 'f3', icon: 'i-lucide-radar', to: '#tracking' },
  { key: 'f4', icon: 'i-lucide-headset', to: localePath('/cargo-kontakty') },
]);

// Мини-карточки первого экрана.
const quickLinks = computed(() => [
  { key: 'f1', icon: 'i-lucide-boxes', to: localePath('/cargo-uslugi') },
  { key: 'f2', icon: 'i-lucide-clipboard-list', to: localePath('/account/requests/new') },
  { key: 'f3', icon: 'i-lucide-radar', to: '#tracking' },
]);

// «3 шага к доставке».
const steps = computed(() => [
  { key: 's1', to: localePath('/register') },
  { key: 's2', to: localePath('/cargo-kalkulyator') },
  { key: 's3', to: localePath('/account/requests/new') },
]);

const statIcons = [
  'i-lucide-calendar-check',
  'i-lucide-globe',
  'i-lucide-package-check',
  'i-lucide-thumbs-up',
];

const phoneLabel = '+996 552 165 165';
const whatsappHref = 'https://wa.me/996552165165';
const telegramHref = 'https://t.me/kalita_lida';

const reviews = ['r1', 'r2', 'r3'] as const;
</script>

<template>
  <div class="space-y-2">
    <!-- ======================= ПЕРВЫЙ ЭКРАН ======================= -->
    <section class="site-panel">
      <div class="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_24rem]">
        <div class="min-w-0">
          <h1 class="site-heading text-3xl sm:text-[2.5rem]">{{ t('site.home.title') }}</h1>

          <!-- Мини-карточки -->
          <div class="mt-6 grid gap-2 sm:grid-cols-3">
            <NuxtLink
              v-for="q in quickLinks"
              :key="q.key"
              :to="q.to"
              class="site-card group p-4 transition hover:brightness-[0.98]"
            >
              <div class="flex size-9 items-center justify-center rounded-full bg-brand-500 text-white">
                <UIcon :name="q.icon" class="size-5" />
              </div>
              <p class="mt-3 flex items-center gap-1.5 font-bold">
                {{ t(`site.home.features.${q.key}.title`) }}
                <UIcon name="i-lucide-arrow-right" class="size-4 transition group-hover:translate-x-0.5" />
              </p>
              <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ t(`site.home.features.${q.key}.text`) }}</p>
            </NuxtLink>
          </div>

          <!-- Промо-карусель -->
          <div class="mt-2">
            <SitePromoCarousel />
          </div>
        </div>

        <!-- Расчёт, подсказка, трекинг -->
        <div class="space-y-2">
          <ShippingSearch initial-from="Бишкек" variant="light" />
          <a
            :href="consultationUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-start gap-2 rounded-[1.25rem] bg-amber-50 px-4 py-3 text-sm text-steel-800 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <UIcon name="i-lucide-circle-alert" class="mt-0.5 size-4 shrink-0 text-amber-500" />
            <span>
              <span class="font-semibold">{{ t('site.home.notice.text') }}</span>{{ ' ' }}
              <span class="text-brand-600 dark:text-brand-400">{{ t('site.home.notice.link') }}</span>
            </span>
          </a>
          <SiteTrackingWidget />
        </div>
      </div>
    </section>

    <!-- ========================== УСЛУГИ =========================== -->
    <SitePanel tone="soft" :heading="t('services.heading')">
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="s in services" :key="s.key" class="site-card-white p-6">
          <UIcon :name="s.icon" class="size-8 text-brand-500" />
          <h3 class="mt-4 text-lg font-bold">{{ t(`services.${s.key}.title`) }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-steel-600 dark:text-steel-300">{{ t(`services.${s.key}.text`) }}</p>
        </div>
      </div>
    </SitePanel>

    <!-- ======================== ПОЧЕМУ МЫ ========================== -->
    <SitePanel :heading="t('why.heading')">
      <div class="grid gap-2 sm:grid-cols-2">
        <NuxtLink v-for="f in features" :key="f.key" :to="f.to" class="group relative block">
          <div class="site-card card-notch h-full p-6 pr-16">
            <div class="flex size-10 items-center justify-center rounded-full bg-brand-500 text-white">
              <UIcon :name="f.icon" class="size-5" />
            </div>
            <h3 class="mt-4 text-lg font-bold">{{ t(`why.${f.key}.title`) }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-steel-600 dark:text-steel-300">{{ t(`why.${f.key}.text`) }}</p>
          </div>
          <span
            class="absolute bottom-1 right-1 flex size-11 items-center justify-center rounded-full bg-[#181818] text-white transition group-hover:bg-brand-500 dark:bg-white dark:text-steel-950"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-chevron-right" class="size-5" />
          </span>
        </NuxtLink>
      </div>
    </SitePanel>

    <!-- ===================== 3 ШАГА К ДОСТАВКЕ ===================== -->
    <SitePanel tone="soft" :heading="t('site.home.steps.heading')">
      <div class="grid gap-2 md:grid-cols-3">
        <NuxtLink v-for="(step, i) in steps" :key="step.key" :to="step.to" class="group relative block">
          <div
            class="card-notch h-full rounded-[1.5rem] p-6 pr-16"
            :class="i === steps.length - 1 ? 'bg-[#2f2f2f] text-white dark:bg-brand-900' : 'bg-white dark:bg-steel-800'"
          >
            <p class="text-3xl font-extrabold" :class="i === steps.length - 1 ? 'text-brand-300' : 'text-brand-500'">
              0{{ i + 1 }}
            </p>
            <h3 class="mt-4 text-lg font-bold">{{ t(`site.home.steps.${step.key}.title`) }}</h3>
            <p class="mt-1.5 text-sm" :class="i === steps.length - 1 ? 'text-white/75' : 'text-steel-600 dark:text-steel-300'">
              {{ t(`site.home.steps.${step.key}.text`) }}
            </p>
          </div>
          <span
            class="absolute bottom-1 right-1 flex size-11 items-center justify-center rounded-full transition group-hover:bg-brand-500 group-hover:text-white"
            :class="i === steps.length - 1 ? 'bg-white text-steel-950' : 'bg-[#181818] text-white dark:bg-white dark:text-steel-950'"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-chevron-right" class="size-5" />
          </span>
        </NuxtLink>
      </div>
    </SitePanel>

    <!-- ===================== AsDi Cargo — это ====================== -->
    <SitePanel :heading="t('site.home.statsHeading')">
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <AnimatedStat
          v-for="(s, i) in stats"
          :key="s.label"
          :value="s.value"
          :label="s.label"
          :icon="statIcons[i % statIcons.length]"
        />
      </div>
    </SitePanel>

    <!-- ========================== ОТЗЫВЫ =========================== -->
    <section id="reviews" class="scroll-mt-32">
      <SitePanel tone="soft" :heading="t('reviews.heading')">
        <div class="grid gap-2 md:grid-cols-3">
          <figure v-for="r in reviews" :key="r" class="site-card-white flex flex-col p-6">
            <div class="mb-3 flex gap-0.5 text-brand-500" aria-hidden="true">
              <UIcon v-for="n in 5" :key="n" name="i-lucide-star" class="size-4 fill-current" />
            </div>
            <blockquote class="flex-1 text-sm leading-relaxed text-steel-700 dark:text-steel-200">
              “{{ t(`reviews.${r}.text`) }}”
            </blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <UAvatar :alt="t(`reviews.${r}.name`)" icon="i-lucide-user" size="sm" />
              <span>
                <span class="block text-sm font-bold">{{ t(`reviews.${r}.name`) }}</span>
                <span class="block text-xs text-steel-500">{{ t(`reviews.${r}.role`) }}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </SitePanel>
    </section>

    <!-- ===================== СВЯЖИТЕСЬ С НАМИ ====================== -->
    <section id="contact" class="scroll-mt-32">
      <SitePanel :heading="t('site.contact.heading')">
        <div class="space-y-2">
          <div class="site-card p-5 sm:p-6">
            <p class="text-lg font-bold">{{ t('site.contact.call') }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <a href="tel:+996552165165" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold dark:bg-steel-900">
                <UIcon name="i-lucide-phone" class="size-4 text-brand-500" />
                {{ phoneLabel }}
              </a>
              <a :href="whatsappHref" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold dark:bg-steel-900">
                <UIcon name="i-lucide-message-circle" class="size-4 text-[#25D366]" />
                WhatsApp
              </a>
              <a :href="telegramHref" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold dark:bg-steel-900">
                <UIcon name="i-lucide-send" class="size-4 text-[#229ED9]" />
                Telegram
              </a>
            </div>
          </div>
          <SiteCallbackForm />
        </div>
      </SitePanel>
    </section>
  </div>
</template>
