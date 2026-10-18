<script setup lang="ts">
/**
 * Секция-«панель» сайта: крупный скруглённый блок на сером фоне страницы.
 * tone: white — белая панель (карточки внутри голубовато-серые), soft — серая
 * (карточки внутри белые). Контент выровнен по общей сетке max-w-6xl.
 */
withDefaults(defineProps<{ tone?: 'white' | 'soft'; heading?: string; tight?: boolean }>(), {
  tone: 'white',
  heading: undefined,
  tight: false,
});
</script>

<template>
  <section :class="tone === 'soft' ? 'site-panel-soft' : 'site-panel'">
    <div class="mx-auto max-w-6xl px-4 sm:px-8" :class="tight ? 'py-6 sm:py-8' : 'py-8 sm:py-12'">
      <div v-if="heading || $slots.actions" class="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <h2 v-if="heading" class="site-heading text-2xl sm:text-[2rem]">{{ heading }}</h2>
        <slot name="actions" />
      </div>
      <slot />
    </div>
  </section>
</template>
