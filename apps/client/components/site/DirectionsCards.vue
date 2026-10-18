<script setup lang="ts">
/**
 * Страница «Направления»: каждый блок `<h3>` из контента админки — карточка
 * маршрута с анимированной линией «откуда → куда», городами, преимуществами и
 * кнопками расчёта / заявки (маршрут подставляется в калькулятор и заявку).
 * Страны маршрута определяются по заголовку («Россия → Кыргызстан», «Бишкек →
 * Казахстан»), поэтому новые направления из админки выводятся в том же стиле.
 * Маршрут подставляется в калькулятор и заявку только для RU ↔ KG.
 */
import { KG_CITIES, RU_CITIES } from '~/utils/cities';

interface DirectionSection {
  label: string;
  content: string;
}

type Country = 'ru' | 'kg' | 'kz';
/** Страны, между которыми работают калькулятор и заявки. */
type MainCountry = 'ru' | 'kg';

const props = defineProps<{ sections: DirectionSection[] }>();

const { t } = useI18n();
const localePath = useLocalePath();

const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=996552165165&type=phone_number&app_absent=0';

// Город-хаб страны, который подставляется в калькулятор и заявку.
const HUB: Record<MainCountry, string> = { ru: RU_CITIES[0], kg: KG_CITIES[0] };

const COUNTRY_PATTERNS: Record<Country, RegExp> = {
  ru: /росси|russia|москв|moscow/i,
  kg: /кыргыз|киргиз|kyrgyz|бишкек|bishkek/i,
  kz: /каза[хк]|kazakh|алмат|almaty/i,
};

/** Страна конца маршрута («Россия», «Бишкек», «Казахстан»). */
function countryOf(name: string): Country | null {
  return (
    (Object.keys(COUNTRY_PATTERNS) as Country[]).find((c) => COUNTRY_PATTERNS[c].test(name)) ?? null
  );
}

function isMain(country: Country | null): country is MainCountry {
  return country === 'ru' || country === 'kg';
}

/** Концы маршрута как они написаны в заголовке («Россия», «Кыргызстан»). */
function endpointsOf(label: string): [string, string] {
  const parts = label.split(/\s*(?:→|->|—|–)\s*/).filter(Boolean);
  return [parts[0] ?? label, parts[1] ?? ''];
}

/** Подпись под концом маршрута: город-хаб, если в заголовке указана страна. */
function hubLabel(name: string, country: Country | null): string {
  if (!isMain(country)) return '';
  const hub = t(`site.directionsPage.hub.${country}`);
  return name.toLowerCase().includes(HUB[country].toLowerCase()) ? '' : hub;
}

const cards = computed(() =>
  props.sections.map((section) => {
    const [fromName, toName] = endpointsOf(section.label);
    const fromCountry = countryOf(fromName);
    const toCountry = countryOf(toName);
    // Маршрут, который можно подставить в калькулятор и заявку (RU ↔ KG).
    const route =
      isMain(fromCountry) && isMain(toCountry) && fromCountry !== toCountry
        ? { from: fromCountry, to: toCountry }
        : null;
    return {
      ...section,
      route,
      fromName,
      toName,
      fromCode: fromCountry?.toUpperCase() ?? '',
      toCode: toCountry?.toUpperCase() ?? '',
      fromHub: hubLabel(fromName, fromCountry),
      toHub: hubLabel(toName, toCountry),
      cities: isMain(fromCountry) ? t(`site.directionsPage.cities.${fromCountry}`).split(', ') : [],
      calcLink: route
        ? {
            path: localePath('/cargo-kalkulyator'),
            query: { from: HUB[route.from], to: HUB[route.to] },
          }
        : localePath('/cargo-kalkulyator'),
      requestLink: route
        ? {
            path: localePath('/account/requests/new'),
            query: {
              direction: `${route.from}_${route.to}`,
              from: HUB[route.from],
              to: HUB[route.to],
            },
          }
        : localePath('/account/requests/new'),
    };
  }),
);

const steps = computed(() =>
  (['receive', 'consolidate', 'transit', 'pickup'] as const).map((key, i) => ({
    key,
    icon: ['i-lucide-warehouse', 'i-lucide-boxes', 'i-lucide-truck', 'i-lucide-hand-helping'][i],
    title: t(`site.directionsPage.steps.${key}.title`),
    text: t(`site.directionsPage.steps.${key}.text`),
  })),
);

// Появление при прокрутке: карточки и шаги «выезжают» по очереди один раз.
const cardsRef = ref<HTMLElement | null>(null);
const stepsRef = ref<HTMLElement | null>(null);
const cardsVisible = ref(false);
const stepsVisible = ref(false);

function revealOnce(target: Ref<HTMLElement | null>, flag: Ref<boolean>): void {
  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        flag.value = true;
        stop();
      }
    },
    { threshold: 0.15 },
  );
}

revealOnce(cardsRef, cardsVisible);
revealOnce(stepsRef, stepsVisible);
</script>

<template>
  <div class="space-y-2">
    <!-- Карточки маршрутов -->
    <SitePanel tone="soft">
      <div ref="cardsRef" class="grid gap-4 lg:grid-cols-2">
        <article
          v-for="(card, i) in cards"
          :key="card.label"
          class="reveal group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-steel-900"
          :class="{ 'is-visible': cardsVisible }"
          :style="{ transitionDelay: cardsVisible ? `${i * 120}ms` : '0ms' }"
        >
          <!-- Визуал маршрута -->
          <div
            class="relative overflow-hidden p-6 text-white sm:p-8"
            :class="i % 2 === 0 ? 'bg-brand-gradient' : 'bg-[#2f2f2f]'"
          >
            <div class="absolute -right-16 -top-16 size-56 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-125" />
            <div class="absolute -bottom-24 -left-10 size-64 rounded-full bg-black/10" />

            <p class="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              {{ t('site.directionsPage.kicker') }} {{ String(i + 1).padStart(2, '0') }}
            </p>

            <div class="relative mt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <!-- Откуда -->
              <div class="min-w-0 shrink-0">
                <span
                  v-if="card.fromCode"
                  class="inline-flex rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                >
                  {{ card.fromCode }}
                </span>
                <p class="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">{{ card.fromName }}</p>
                <p v-if="card.fromHub" class="text-sm text-white/70">{{ card.fromHub }}</p>
              </div>

              <!-- Линия с машинкой -->
              <div class="relative h-10 w-full text-white/60 sm:mx-1 sm:w-auto sm:min-w-12 sm:flex-1" aria-hidden="true">
                <span class="absolute left-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white" />
                <span class="route-pulse absolute left-0 top-1/2 -mt-[5px] size-2.5 rounded-full bg-white" />
                <span class="route-line absolute inset-x-3 top-1/2 h-0.5 -translate-y-1/2" />
                <span class="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white" />
                <span
                  class="route-truck absolute top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-600 shadow-lg"
                >
                  <UIcon name="i-lucide-truck" class="size-4.5" />
                </span>
              </div>

              <!-- Куда -->
              <div class="min-w-0 shrink-0 self-end text-right sm:self-auto">
                <span
                  v-if="card.toCode"
                  class="inline-flex rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                >
                  {{ card.toCode }}
                </span>
                <p class="mt-2 text-xl font-extrabold leading-tight sm:text-2xl">{{ card.toName }}</p>
                <p v-if="card.toHub" class="text-sm text-white/70">{{ card.toHub }}</p>
              </div>
            </div>
          </div>

          <!-- Описание -->
          <div class="flex flex-1 flex-col p-6 sm:p-8">
            <h2 class="site-heading text-2xl">{{ card.label }}</h2>
            <div
              v-if="card.content"
              class="prose mt-2 max-w-none text-steel-600 dark:prose-invert dark:text-steel-300"
              v-html="card.content"
            />

            <div v-if="card.cities.length" class="mt-5">
              <p class="text-xs font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
                {{ t('site.directionsPage.citiesLabel') }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="city in card.cities"
                  :key="city"
                  class="rounded-full bg-[#f0f4f9] px-3 py-1 text-sm font-medium dark:bg-steel-800"
                >
                  {{ city }}
                </span>
                <span class="rounded-full px-2 py-1 text-sm text-steel-500 dark:text-steel-400">
                  {{ t('site.directionsPage.citiesMore') }}
                </span>
              </div>
            </div>

            <ul class="mt-5 space-y-2.5">
              <li v-for="n in 3" :key="n" class="flex items-start gap-3">
                <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <UIcon name="i-lucide-check" class="size-3.5" />
                </span>
                <span class="font-medium">{{ t(`site.directionsPage.features.${n - 1}`) }}</span>
              </li>
            </ul>

            <div class="mt-auto flex flex-wrap items-center gap-2 pt-7">
              <NuxtLink :to="card.calcLink" class="btn-ink">
                <UIcon name="i-lucide-calculator" class="size-4" />
                {{ t('site.directionsPage.calc') }}
              </NuxtLink>
              <NuxtLink
                :to="card.requestLink"
                class="inline-flex min-h-[3.125rem] items-center gap-2 rounded-[0.9375rem] bg-[#f0f4f9] px-6 font-semibold transition hover:bg-steel-100 dark:bg-steel-800 dark:hover:bg-steel-700"
              >
                {{ t('site.directionsPage.request') }}
                <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
              </NuxtLink>
              <span v-if="card.route" class="ml-auto text-sm font-semibold text-steel-500 dark:text-steel-400">
                {{ t('calculator.rateWeight') }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </SitePanel>

    <!-- Как идёт груз -->
    <SitePanel :heading="t('site.directionsPage.steps.heading')">
      <div ref="stepsRef" class="relative">
        <!-- Линия прогресса (на десктопе) -->
        <div class="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 bg-steel-200 md:block dark:bg-steel-800" aria-hidden="true">
          <div
            class="h-full origin-left bg-brand-gradient transition-transform duration-[1600ms] ease-out"
            :class="stepsVisible ? 'scale-x-100' : 'scale-x-0'"
          />
        </div>
        <ol class="relative grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <li
            v-for="(step, i) in steps"
            :key="step.key"
            class="reveal flex flex-col items-start md:items-center md:text-center"
            :class="{ 'is-visible': stepsVisible }"
            :style="{ transitionDelay: stepsVisible ? `${i * 250}ms` : '0ms' }"
          >
            <span class="relative flex size-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg ring-8 ring-white dark:ring-steel-900">
              <UIcon :name="step.icon" class="size-6" />
              <span class="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-[#181818] text-xs font-bold text-white dark:bg-white dark:text-[#181818]">
                {{ i + 1 }}
              </span>
            </span>
            <p class="mt-4 font-bold">{{ step.title }}</p>
            <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </SitePanel>

    <!-- Помощь с выбором -->
    <section class="site-panel-soft">
      <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center">
        <div class="max-w-xl">
          <h2 class="site-heading text-2xl sm:text-3xl">{{ t('site.servicesPage.help.title') }}</h2>
          <p class="mt-2 text-steel-600 dark:text-steel-300">{{ t('site.servicesPage.help.text') }}</p>
        </div>
        <a :href="WHATSAPP_URL" target="_blank" rel="noopener noreferrer" class="btn-ink shrink-0">
          <UIcon name="i-lucide-message-circle" class="size-5" />
          {{ t('site.servicesPage.help.whatsapp') }}
        </a>
      </div>
    </section>
  </div>
</template>
