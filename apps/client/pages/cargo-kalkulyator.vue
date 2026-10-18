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
  <div class="space-y-2">
    <PageHero :title="t('calculator.title')" :subtitle="t('calculator.subtitle')" image="/backgrounds/kalkulyator.webp" />

    <SitePanel>
      <div class="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
        <ShippingSearch initial-from="Бишкек" variant="light" />

        <!-- Тарифы и правила расчёта -->
        <aside class="site-card space-y-4 p-6">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-full bg-brand-500 text-white">
              <UIcon name="i-lucide-weight" class="size-5" />
            </div>
            <p class="font-bold">{{ t('calculator.rateWeight') }}</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-full bg-brand-500 text-white">
              <UIcon name="i-lucide-box" class="size-5" />
            </div>
            <p class="font-bold">{{ t('calculator.rateVolume') }}</p>
          </div>
          <p class="border-t border-steel-100 pt-4 text-sm text-steel-600 dark:border-steel-800 dark:text-steel-300">
            {{ t('calculator.note') }}
          </p>
          <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('search.result.note') }}</p>
        </aside>
      </div>
    </SitePanel>
  </div>
</template>
