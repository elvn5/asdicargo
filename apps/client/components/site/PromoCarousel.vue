<script setup lang="ts">
/** Промо-баннеры главной (карусель с автопрокруткой, как на референсе). */
const { t } = useI18n();
const localePath = useLocalePath();

const slides = computed(() => [
  {
    key: 's1',
    icon: 'i-lucide-message-circle',
    to: 'https://api.whatsapp.com/send/?phone=996552165165&type=phone_number&app_absent=0',
    external: true,
  },
  { key: 's2', icon: 'i-lucide-layout-dashboard', to: localePath('/account'), external: false },
  { key: 's3', icon: 'i-lucide-map-pinned', to: localePath('/account/points'), external: false },
]);
</script>

<template>
  <UCarousel
    v-slot="{ item }"
    :items="slides"
    :autoplay="{ delay: 6000 }"
    loop
    dots
    :ui="{
      root: 'relative',
      viewport: 'rounded-[1.5rem]',
      dots: 'absolute bottom-4 left-5 sm:left-7 justify-start gap-1.5',
      dot: 'size-1.5 rounded-full bg-white/50 data-[state=active]:w-5 data-[state=active]:bg-white transition-all',
    }"
  >
    <div class="relative flex min-h-[12rem] items-center overflow-hidden bg-brand-gradient p-5 pb-10 text-white sm:min-h-[13.5rem] sm:p-7 sm:pb-12">
      <div class="relative z-10 max-w-[70%]">
        <p class="text-xs font-medium text-white/75">{{ t(`site.home.promo.${item.key}.label`) }}</p>
        <p class="mt-1 text-lg font-bold leading-snug sm:text-2xl">{{ t(`site.home.promo.${item.key}.title`) }}</p>
        <NuxtLink
          :to="item.to"
          :external="item.external"
          :target="item.external ? '_blank' : undefined"
          class="btn-ink mt-4 !min-h-11 !px-5 text-sm"
        >
          {{ t(`site.home.promo.${item.key}.cta`) }}
        </NuxtLink>
      </div>
      <!-- Декоративная иконка справа -->
      <div class="pointer-events-none absolute -right-4 top-1/2 flex size-40 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 sm:right-6 sm:size-44">
        <UIcon :name="item.icon" class="size-20 text-white/85 sm:size-24" />
      </div>
    </div>
  </UCarousel>
</template>
