<script setup lang="ts">
/**
 * Страница «Услуги»: каждый блок `<h3>` из контента админки — крупная секция
 * с номером, описанием, преимуществами, действием и иллюстрацией-«интерфейсом».
 * Первые три услуги (складирование, доставка, документы) получают свои иллюстрации
 * и списки преимуществ; новые услуги из админки выводятся в том же стиле.
 */
interface ServiceSection {
  label: string;
  content: string;
}

const props = defineProps<{ sections: ServiceSection[] }>();

const { t } = useI18n();
const localePath = useLocalePath();

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=996552165165&type=phone_number&app_absent=0';

type ServiceKey = 'storage' | 'delivery' | 'documents';

const META: Array<{ key: ServiceKey; icon: string; to: string }> = [
  { key: 'storage', icon: 'i-lucide-warehouse', to: '/account/requests/new' },
  { key: 'delivery', icon: 'i-lucide-truck', to: '/cargo-kalkulyator' },
  { key: 'documents', icon: 'i-lucide-file-text', to: '/cargo-kontakty' },
];

// Иллюстрация «Документы»: список документов комплекта с отметками.
const documentItems = computed(() =>
  [0, 1, 2, 3].map((i) => t(`site.servicesPage.documents.mock.items.${i}`)),
);

// Секции с оформлением по порядку: 1-я — складирование, 2-я — доставка, 3-я — документы.
const items = computed(() =>
  props.sections.map((section, index) => {
    const meta = META[index] ?? null;
    return {
      ...section,
      meta,
      highlights: meta ? [0, 1, 2].map((i) => t(`site.servicesPage.${meta.key}.h.${i}`)) : [],
    };
  }),
);
</script>

<template>
  <div class="space-y-2">
    <section v-for="(section, i) in items" :key="section.label" class="site-panel overflow-hidden">
      <div
        class="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-14"
      >
        <!-- Текст -->
        <div :class="i % 2 === 1 ? 'lg:order-2' : ''">
          <p class="flex items-center gap-3 text-sm font-semibold text-brand-600 dark:text-brand-400">
            <span class="text-4xl font-extrabold leading-none tracking-tight">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="h-px w-10 bg-brand-300" aria-hidden="true" />
            {{ t('site.servicesPage.kicker') }}
          </p>
          <h2 class="site-heading mt-5 text-3xl sm:text-[2.5rem]">{{ section.label }}</h2>
          <div class="prose mt-4 max-w-none text-lg text-steel-600 dark:prose-invert dark:text-steel-300" v-html="section.content" />

          <ul v-if="section.highlights.length" class="mt-6 space-y-3">
            <li v-for="item in section.highlights" :key="item" class="flex items-start gap-3">
              <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <UIcon name="i-lucide-check" class="size-3.5" />
              </span>
              <span class="font-medium">{{ item }}</span>
            </li>
          </ul>

          <NuxtLink v-if="section.meta" :to="localePath(section.meta.to)" class="btn-ink mt-8">
            {{ t(`site.servicesPage.${section.meta.key}.cta`) }}
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </NuxtLink>
        </div>

        <!-- Иллюстрация -->
        <div :class="i % 2 === 1 ? 'lg:order-1' : ''" aria-hidden="true">
          <!-- 01 · Складирование грузов -->
          <div
            v-if="section.meta?.key === 'storage'"
            class="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[1.75rem] bg-brand-gradient p-6"
          >
            <div class="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
            <div class="absolute -bottom-20 -left-10 size-64 rounded-full bg-black/10" />
            <!-- Стеллаж с коробками -->
            <div class="absolute left-6 top-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-black/15 p-2.5 sm:left-10 sm:top-10">
              <span v-for="n in 6" :key="n" class="size-7 rounded-md" :class="n === 5 ? 'bg-white' : 'bg-white/25'" />
            </div>
            <div class="relative w-full max-w-xs rotate-[-3deg] rounded-[1.25rem] bg-white p-5 text-steel-900 shadow-2xl">
              <div class="flex items-center justify-between">
                <span class="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <UIcon name="i-lucide-warehouse" class="size-6" />
                </span>
                <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {{ t('site.servicesPage.storage.mock.status') }}
                </span>
              </div>
              <p class="mt-4 text-xs text-steel-500">{{ t('site.servicesPage.storage.mock.cell') }}</p>
              <p class="font-mono text-lg font-bold">B-12</p>
              <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div class="rounded-xl bg-[#f0f4f9] px-3 py-2">
                  <p class="text-xs text-steel-500">{{ t('site.servicesPage.storage.mock.volume') }}</p>
                  <p class="font-bold">8,5 {{ t('calculator.volumeUnit') }}</p>
                </div>
                <div class="rounded-xl bg-[#f0f4f9] px-3 py-2">
                  <p class="text-xs text-steel-500">{{ t('site.servicesPage.storage.mock.places') }}</p>
                  <p class="font-bold">24</p>
                </div>
              </div>
            </div>
            <div class="absolute bottom-6 right-6 rotate-[4deg] rounded-2xl bg-[#181818] px-4 py-3 text-white shadow-xl sm:bottom-10 sm:right-10">
              <p class="text-[11px] text-white/60">{{ t('site.servicesPage.storage.mock.code') }}</p>
              <p class="text-sm font-bold tracking-wide">AS-1024</p>
            </div>
          </div>

          <!-- 02 · Доставка грузов -->
          <div
            v-else-if="section.meta?.key === 'delivery'"
            class="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#2f2f2f] p-6"
          >
            <div class="absolute inset-x-0 top-1/2 h-px bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.25)_0_12px,transparent_12px_24px)]" />
            <div class="absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/25 blur-2xl" />
            <div class="relative w-full max-w-sm rounded-[1.25rem] bg-white p-5 text-steel-900 shadow-2xl">
              <p class="text-xs text-steel-500">{{ t('site.servicesPage.delivery.mock.route') }}</p>
              <div class="mt-2 flex items-center justify-between font-bold">
                <span>{{ t('site.servicesPage.mock.from') }}</span>
                <UIcon name="i-lucide-arrow-left-right" class="size-4 text-steel-400" />
                <span>{{ t('site.servicesPage.mock.to') }}</span>
              </div>
              <!-- Прогресс маршрута -->
              <div class="relative mt-4 h-2 rounded-full bg-steel-100">
                <div class="absolute inset-y-0 left-0 w-3/5 rounded-full bg-brand-gradient" />
                <span class="absolute left-3/5 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg">
                  <UIcon name="i-lucide-truck" class="size-4" />
                </span>
              </div>
              <div class="mt-5 flex items-center justify-between">
                <span class="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  {{ t('site.servicesPage.delivery.mock.status') }}
                </span>
                <span class="text-xs text-steel-500">ASD-240518</span>
              </div>
            </div>
            <div class="absolute left-6 top-6 rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur sm:left-10 sm:top-10">
              <p class="text-[11px] text-white/60">{{ t('site.servicesPage.delivery.mock.tariff') }}</p>
              <p class="text-sm font-bold">50 {{ t('calculator.som') }} / {{ t('calculator.weightUnit') }}</p>
            </div>
          </div>

          <!-- 03 · Подготовка документов -->
          <div
            v-else-if="section.meta?.key === 'documents'"
            class="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#f0f4f9] p-6 dark:bg-steel-800"
          >
            <!-- Листы «под» карточкой -->
            <div class="absolute h-[62%] w-[52%] rotate-[8deg] rounded-[1.25rem] bg-white/60 shadow dark:bg-white/10" />
            <div class="absolute h-[62%] w-[52%] -rotate-[6deg] rounded-[1.25rem] bg-white/80 shadow dark:bg-white/15" />
            <div class="relative w-full max-w-xs rounded-[1.25rem] bg-white p-5 text-steel-900 shadow-2xl">
              <div class="flex items-center gap-3">
                <span class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <UIcon name="i-lucide-file-text" class="size-5" />
                </span>
                <p class="font-bold">{{ t('site.servicesPage.documents.mock.title') }}</p>
              </div>
              <ul class="mt-4 space-y-2 text-sm">
                <li
                  v-for="doc in documentItems"
                  :key="doc"
                  class="flex items-center justify-between rounded-xl bg-[#f0f4f9] px-3 py-2"
                >
                  <span class="font-medium">{{ doc }}</span>
                  <UIcon name="i-lucide-circle-check" class="size-4 text-emerald-600" />
                </li>
              </ul>
            </div>
            <div class="absolute bottom-6 right-6 rotate-[4deg] rounded-2xl bg-brand-500 px-4 py-3 text-white shadow-xl sm:bottom-10 sm:right-10">
              <p class="flex items-center gap-1.5 text-sm font-bold">
                <UIcon name="i-lucide-stamp" class="size-4" />
                {{ t('site.servicesPage.documents.mock.ready') }}
              </p>
            </div>
          </div>

          <!-- Новая услуга из админки -->
          <div
            v-else
            class="flex aspect-[5/4] items-center justify-center rounded-[1.75rem] bg-brand-gradient"
          >
            <UIcon name="i-lucide-sparkles" class="size-20 text-white/85" />
          </div>
        </div>
      </div>
    </section>

    <!-- Помощь с выбором -->
    <section class="site-panel-soft">
      <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center">
        <div class="max-w-xl">
          <h2 class="site-heading text-2xl sm:text-3xl">{{ t('site.servicesPage.help.title') }}</h2>
          <p class="mt-2 text-steel-600 dark:text-steel-300">{{ t('site.servicesPage.help.text') }}</p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer" class="btn-ink">
            <UIcon name="i-lucide-message-circle" class="size-5" />
            {{ t('site.servicesPage.help.whatsapp') }}
          </a>
          <NuxtLink
            :to="localePath('/cargo-kalkulyator')"
            class="inline-flex min-h-[3.125rem] items-center gap-2 rounded-[0.9375rem] bg-white px-6 font-semibold transition hover:bg-steel-50 dark:bg-steel-800 dark:hover:bg-steel-700"
          >
            <UIcon name="i-lucide-calculator" class="size-5 text-brand-500" />
            {{ t('site.servicesPage.help.calc') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
