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
// Тянем публичные настройки; при ошибке/пустом значении — fallback на бота.
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
  { key: 'receive', icon: 'i-lucide-package' },
  { key: 'delivery', icon: 'i-lucide-truck' },
  { key: 'pickup', icon: 'i-lucide-map-pin' },
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

// Блок «Почему выбирают нас».
const features = [
  { key: 'f1', icon: 'i-lucide-award' },
  { key: 'f2', icon: 'i-lucide-calculator' },
  { key: 'f3', icon: 'i-lucide-radar' },
  { key: 'f4', icon: 'i-lucide-headset' },
] as const;

const reviews = ['r1', 'r2', 'r3'] as const;
</script>

<template>
  <div>
    <!-- ============================ HERO ============================ -->
    <!-- isolate: без него фон с -z-10 перекрывается bg-white/dark:bg-steel-950 обёртки лэйаута -->
    <section class="relative isolate overflow-hidden">
      <!-- Фоновое фото + затемняющий градиент -->
      <div class="absolute inset-0 -z-10">
        <img
          src="/hero-cargo.jpg"
          :alt="t('hero.imageAlt')"
          class="h-full w-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-steel-950/90 via-steel-950/75 to-steel-950/40"
        />
      </div>

      <div class="mx-auto w-full max-w-6xl px-4 py-20 sm:py-24 md:py-32">
        <div class="glass-card max-w-xl rounded-brand-xl p-7 shadow-brand-card sm:p-10">
          <span
            class="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90"
          >
            {{ t('hero.badge') }}
          </span>

          <h1 class="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            {{ t('hero.titleLead') }}
            <span class="text-brand-300">{{ t('hero.titleAccent') }}</span>
          </h1>

          <p class="mt-4 max-w-md whitespace-pre-line text-lg text-white/80">
            {{ t('hero.subtitle') }}
          </p>

          <!-- Чипы-акценты -->
          <div class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="chip in ['chipRoute', 'chipSince', 'chipClients']"
              :key="chip"
              class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15"
            >
              <span class="size-1.5 rounded-full bg-brand-400" aria-hidden="true" />
              {{ t(`hero.${chip}`) }}
            </span>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              :href="consultationUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:brightness-110"
            >
              <UIcon name="i-lucide-message-circle" class="size-5" />
              {{ t('hero.ctaStart') }}
            </a>
            <NuxtLink
              :to="localePath('/cargo-kalkulyator')"
              class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <UIcon name="i-lucide-calculator" class="size-5" />
              {{ t('hero.ctaCalc') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= СТАТИСТИКА ========================= -->
    <section class="bg-steel-950 text-white">
      <div class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
        <h2 class="mb-12 text-center text-3xl font-bold sm:text-4xl">
          {{ t('stats.heading') }}
        </h2>
        <div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <AnimatedStat v-for="s in stats" :key="s.label" :value="s.value" :label="s.label" />
        </div>
      </div>
    </section>

    <!-- ========================== УСЛУГИ =========================== -->
    <section class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
      <div class="mb-10 text-center">
        <h2 class="text-3xl font-bold sm:text-4xl">{{ t('services.heading') }}</h2>
        <p class="mt-3 text-steel-600 dark:text-steel-300">{{ t('services.sub') }}</p>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="s in services"
          :key="s.key"
          class="group rounded-brand-lg border border-steel-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-brand-card dark:border-steel-800 dark:bg-steel-900/50"
        >
          <div
            class="mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand-900/20"
          >
            <UIcon :name="s.icon" class="size-7" />
          </div>
          <h3 class="text-xl font-semibold">{{ t(`services.${s.key}.title`) }}</h3>
          <p class="mt-2 leading-relaxed text-steel-600 dark:text-steel-300">
            {{ t(`services.${s.key}.text`) }}
          </p>
        </div>
      </div>
    </section>

    <!-- ======================== ПОЧЕМУ МЫ ========================== -->
    <section class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
      <div class="mb-10 text-center">
        <h2 class="text-3xl font-bold sm:text-4xl">{{ t('why.heading') }}</h2>
        <p class="mt-3 text-steel-600 dark:text-steel-300">{{ t('why.sub') }}</p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2">
        <div
          v-for="f in features"
          :key="f.key"
          class="flex items-start gap-5 rounded-brand-lg border border-steel-200 bg-white p-6 transition hover:shadow-brand-card dark:border-steel-800 dark:bg-steel-900/50"
        >
          <div
            class="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
          >
            <UIcon :name="f.icon" class="size-7" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">{{ t(`why.${f.key}.title`) }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-steel-600 dark:text-steel-300">
              {{ t(`why.${f.key}.text`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================== ОТЗЫВЫ =========================== -->
    <section id="reviews" class="scroll-mt-16 bg-steel-50 dark:bg-steel-900/40">
      <div class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-bold sm:text-4xl">{{ t('reviews.heading') }}</h2>
          <p class="mt-3 text-steel-600 dark:text-steel-300">{{ t('reviews.sub') }}</p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <figure
            v-for="r in reviews"
            :key="r"
            class="flex flex-col rounded-brand-lg border border-steel-200 bg-white p-6 shadow-sm dark:border-steel-800 dark:bg-steel-950"
          >
            <div class="mb-3 flex gap-0.5 text-brand-500" aria-hidden="true">
              <UIcon v-for="n in 5" :key="n" name="i-lucide-star" class="size-4 fill-current" />
            </div>
            <blockquote class="flex-1 text-steel-700 dark:text-steel-200">
              “{{ t(`reviews.${r}.text`) }}”
            </blockquote>
            <figcaption class="mt-5 flex items-center gap-3">
              <UAvatar :alt="t(`reviews.${r}.name`)" icon="i-lucide-user" size="sm" />
              <span>
                <span class="block text-sm font-semibold">{{ t(`reviews.${r}.name`) }}</span>
                <span class="block text-xs text-steel-500">{{ t(`reviews.${r}.role`) }}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  </div>
</template>
