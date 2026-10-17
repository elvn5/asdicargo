<script setup lang="ts">
/**
 * Шапка внутренней страницы: фоновое фото + затемняющий градиент поверх,
 * чтобы белый заголовок читался на любом снимке. Без фото — фирменный градиент.
 */
defineProps<{ image?: string; maxWidth?: 'max-w-3xl' | 'max-w-4xl' }>();
</script>

<template>
  <!-- isolate: без него фон с -z-10 перекрывается фоном обёртки лэйаута -->
  <section
    class="relative isolate overflow-hidden"
    :class="image ? 'bg-steel-950' : 'bg-brand-steel-gradient'"
  >
    <div v-if="image" class="absolute inset-0 -z-10">
      <img :src="image" alt="" class="h-full w-full object-cover" fetchpriority="high" />
      <div
        class="absolute inset-0 bg-gradient-to-r from-steel-950/90 via-steel-950/70 to-steel-950/40"
      />
    </div>
    <div
      v-else
      class="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-96 rounded-full bg-white/10 blur-3xl"
      aria-hidden="true"
    />
    <div class="mx-auto w-full px-4 py-14 md:py-20" :class="maxWidth ?? 'max-w-4xl'">
      <slot />
    </div>
  </section>
</template>
