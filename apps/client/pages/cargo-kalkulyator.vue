<script setup lang="ts">
const { t } = useI18n();
const config = useRuntimeConfig();
const botUrl = config.public.botUrl as string;

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
  <section class="mx-auto w-full max-w-3xl px-4 py-16">
    <h1 class="text-3xl font-bold sm:text-4xl">{{ t('calculator.title') }}</h1>
    <p class="mt-3 text-steel-600 dark:text-steel-300">{{ t('calculator.subtitle') }}</p>

    <div
      class="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-steel-200 bg-steel-50 p-6 dark:border-steel-800 dark:bg-steel-900/40"
    >
      <div class="flex items-center gap-3">
        <span class="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <UIcon name="i-lucide-calculator" class="size-6" />
        </span>
        <p class="font-medium">{{ t('calculator.soon') }}</p>
      </div>
      <p class="text-sm text-steel-600 dark:text-steel-300">{{ t('calculator.hint') }}</p>
      <UButton :to="botUrl" target="_blank" size="lg" icon="i-lucide-send" color="primary">
        {{ t('calculator.cta') }}
      </UButton>
    </div>
  </section>
</template>
