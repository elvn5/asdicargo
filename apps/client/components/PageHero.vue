<script setup lang="ts">
/**
 * Шапка внутренней страницы: панель с «хлебными крошками», заголовком и
 * подзаголовком; фото страницы (если есть) — скруглённой карточкой справа.
 */
defineProps<{ title: string; subtitle?: string; image?: string }>();

const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <section class="site-panel">
    <div class="mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 sm:px-8 sm:py-10" :class="image ? 'md:grid-cols-[1fr_22rem]' : ''">
      <div>
        <nav class="flex items-center gap-1.5 text-xs text-steel-500 dark:text-steel-400" aria-label="Breadcrumb">
          <NuxtLink :to="localePath('/')" class="hover:text-brand-600">{{ t('site.breadcrumbs.home') }}</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <span class="truncate text-steel-700 dark:text-steel-200">{{ title }}</span>
        </nav>
        <h1 class="site-heading mt-3 text-3xl sm:text-[2.5rem]">{{ title }}</h1>
        <p v-if="subtitle" class="mt-3 max-w-2xl text-steel-600 dark:text-steel-300">{{ subtitle }}</p>
        <slot />
      </div>
      <div v-if="image" class="hidden h-44 overflow-hidden rounded-[1.5rem] md:block">
        <img :src="image" alt="" class="h-full w-full object-cover" fetchpriority="high" />
      </div>
    </div>
  </section>
</template>
