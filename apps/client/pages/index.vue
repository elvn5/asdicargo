<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
});

// hreflang для всех локалей главной
const seoAlternates = useSeoAlternates();
useHead(() => ({ link: seoAlternates.value }));

const config = useRuntimeConfig();
const botUrl = config.public.botUrl as string;



const statuses = ['created', 'warehouse', 'transit', 'ready'] as const;
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-steel-50 dark:from-steel-950 dark:via-steel-950 dark:to-steel-900"
      />
      <div class="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
        <div>
          <UBadge color="primary" variant="soft" class="mb-4">{{ $t('hero.badge') }}</UBadge>
          <h1 class="text-4xl font-bold leading-tight sm:text-5xl">
            {{ $t('hero.titleLead') }}
            <span class="text-brand-600 dark:text-brand-400">{{ $t('hero.titleAccent') }}</span>
          </h1>
          <p class="mt-4 max-w-md whitespace-pre-line text-lg text-steel-600 dark:text-steel-300">
            {{ $t('hero.subtitle') }}
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton :to="botUrl" target="_blank" size="lg" icon="i-lucide-message-circle" color="primary">
              {{ $t('hero.ctaStart') }}
            </UButton>
          </div>
        </div>

        <div class="relative">
          <div
            class="rounded-2xl border border-steel-200 bg-white p-6 shadow-xl shadow-steel-900/5 dark:border-steel-800 dark:bg-steel-900"
          >
            <div class="flex items-center gap-3">
              <span class="flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                <UIcon name="i-lucide-package-check" class="size-6" />
              </span>
              <div>
                <p class="font-semibold">№AC-2048</p>
                <p class="text-sm text-steel-500 dark:text-steel-400">{{ $t('hero.cardReady') }}</p>
              </div>
              <UBadge color="primary" variant="subtle" class="ml-auto">{{ $t('hero.cardBadge') }}</UBadge>
            </div>
            <div class="mt-5 space-y-3">
              <div v-for="s in statuses" :key="s" class="flex items-center gap-3">
                <span class="size-2.5 rounded-full bg-brand-500" aria-hidden="true" />
                <span class="text-sm text-steel-600 dark:text-steel-300">{{ $t(`hero.status.${s}`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>



  </div>
</template>
