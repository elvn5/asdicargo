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

        <div class="relative mx-auto w-full max-w-sm md:mx-0 md:ml-auto">
          <!-- декоративное свечение -->
          <div
            class="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-brand-500/25 blur-2xl dark:bg-brand-500/15"
            aria-hidden="true"
          />
          <img
            src="/hero-cargo.jpg"
            :alt="$t('hero.imageAlt')"
            width="399"
            height="501"
            class="w-full rounded-2xl border border-steel-200 object-cover shadow-2xl shadow-steel-900/15 ring-1 ring-steel-900/5 dark:border-steel-800 dark:ring-white/5"
          />
        </div>
      </div>
    </section>



  </div>
</template>
