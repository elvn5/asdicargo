<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('calculator.title')} — AsDi Cargo`,
  description: () => t('calculator.subtitle'),
  ogTitle: () => `${t('calculator.title')} — AsDi Cargo`,
  ogDescription: () => t('calculator.subtitle'),
});

const seoAlternates = useSeoAlternates();
useHead(() => ({ link: seoAlternates.value }));
</script>

<template>
  <div>
    <!-- Шапка с фоновым фото -->
    <PageHero image="/backgrounds/kalkulyator.webp" max-width="max-w-5xl">
      <h1 class="text-3xl font-bold leading-tight text-white sm:text-4xl">
        {{ t('calculator.title') }}
      </h1>
      <p class="mt-3 max-w-xl text-white/80">{{ t('calculator.subtitle') }}</p>
    </PageHero>

    <section class="mx-auto grid w-full max-w-5xl items-start gap-6 px-4 py-12 lg:grid-cols-[1fr_20rem]">
      <ShippingSearch initial-from="Бишкек" />

      <!-- Тарифы и правила расчёта -->
      <aside
        class="space-y-4 rounded-brand-lg border border-steel-200 bg-white p-6 dark:border-steel-800 dark:bg-steel-900/40"
      >
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <UIcon name="i-lucide-weight" class="size-5" />
          </div>
          <p class="font-semibold">{{ t('calculator.rateWeight') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <UIcon name="i-lucide-box" class="size-5" />
          </div>
          <p class="font-semibold">{{ t('calculator.rateVolume') }}</p>
        </div>
        <p class="border-t border-steel-100 pt-4 text-sm text-steel-600 dark:border-steel-800 dark:text-steel-300">
          {{ t('calculator.note') }}
        </p>
        <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('search.result.note') }}</p>
      </aside>
    </section>
  </div>
</template>
