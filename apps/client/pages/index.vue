<script setup lang="ts">
const { t } = useI18n();
const config = useRuntimeConfig();
const botUrl = config.public.botUrl as string;

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
const apiBase = (
  import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl
) as string;
const { data: settings } = await useFetch<{ consultationUrl: string | null }>(
  () => `${apiBase}/support/public`,
  { key: 'public-settings', server: true, default: () => null },
);
const consultationUrl = computed(() => settings.value?.consultationUrl || botUrl);

// Шаги «Как мы работаем» и отзывы берём из i18n.
const steps = ['s1', 's2', 's3', 's4'] as const;
const stepIcons: Record<(typeof steps)[number], string> = {
  s1: 'i-lucide-user-plus',
  s2: 'i-lucide-shopping-bag',
  s3: 'i-lucide-radar',
  s4: 'i-lucide-package-check',
};
const reviews = ['r1', 'r2', 'r3'] as const;
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-steel-50 dark:from-steel-950 dark:via-steel-950 dark:to-steel-900"
      />
      <div
        class="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24"
      >
        <div>
          <UBadge color="primary" variant="soft" class="mb-4">{{ t('hero.badge') }}</UBadge>
          <h1 class="text-4xl font-bold leading-tight sm:text-5xl">
            {{ t('hero.titleLead') }}
            <span class="text-brand-600 dark:text-brand-400">{{ t('hero.titleAccent') }}</span>
          </h1>
          <p class="mt-4 max-w-md whitespace-pre-line text-lg text-steel-600 dark:text-steel-300">
            {{ t('hero.subtitle') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton
              :to="consultationUrl"
              target="_blank"
              size="lg"
              icon="i-lucide-message-circle"
              color="primary"
            >
              {{ t('hero.ctaStart') }}
            </UButton>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-sm md:mx-0 md:ml-auto">
          <div
            class="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-brand-500/25 blur-2xl dark:bg-brand-500/15"
            aria-hidden="true"
          />
          <img
            src="/hero-cargo.jpg"
            :alt="t('hero.imageAlt')"
            width="399"
            height="501"
            class="w-full rounded-2xl border border-steel-200 object-cover shadow-2xl shadow-steel-900/15 ring-1 ring-steel-900/5 dark:border-steel-800 dark:ring-white/5"
          />
        </div>
      </div>
    </section>

    <!-- Как мы работаем -->
    <section class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
      <div class="mb-10 text-center">
        <h2 class="text-3xl font-bold sm:text-4xl">{{ t('how.heading') }}</h2>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(step, i) in steps"
          :key="step"
          class="relative flex flex-col rounded-2xl border border-steel-200 bg-white p-6 dark:border-steel-800 dark:bg-steel-900/40"
        >
          <div
            class="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
          >
            <UIcon :name="stepIcons[step]" class="size-6" />
          </div>
          <span class="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <h3 class="mt-1 text-lg font-semibold">{{ t(`how.${step}.title`) }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-steel-600 dark:text-steel-300">
            {{ t(`how.${step}.text`) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Отзывы -->
    <section class="bg-steel-50 dark:bg-steel-900/40">
      <div class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
        <div class="mb-10 text-center">
          <h2 class="text-3xl font-bold sm:text-4xl">{{ t('reviews.heading') }}</h2>
          <p class="mt-3 text-steel-600 dark:text-steel-300">{{ t('reviews.sub') }}</p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <figure
            v-for="r in reviews"
            :key="r"
            class="flex flex-col rounded-2xl border border-steel-200 bg-white p-6 dark:border-steel-800 dark:bg-steel-950"
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

    <!-- Финальный CTA -->
    <section class="mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
      <div
        class="relative overflow-hidden rounded-3xl border border-steel-200 bg-gradient-to-br from-brand-50 via-white to-steel-50 px-6 py-12 text-center dark:border-steel-800 dark:from-steel-900 dark:via-steel-950 dark:to-steel-900 md:px-12"
      >
        <h2 class="mx-auto max-w-2xl text-2xl font-bold sm:text-3xl">{{ t('cta.heading') }}</h2>
        <p class="mx-auto mt-3 max-w-xl text-steel-600 dark:text-steel-300">{{ t('cta.text') }}</p>
        <div class="mt-8 flex justify-center">
          <UButton
            :to="consultationUrl"
            target="_blank"
            size="lg"
            icon="i-lucide-send"
            color="primary"
          >
            {{ t('cta.button') }}
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
