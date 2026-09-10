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

// Тарифы
const WEIGHT_RATE = 50; // сом за 1 кг
const VOLUME_RATE = 10_000; // сом за 1 м³

const weight = ref<number>(0);
const volume = ref<number>(0);

// Ручной режим: «в одном кубе меньше 200 кг» — считать строго по объёму (кубатуре)
const forceVolume = ref<boolean>(false);

const w = computed(() => (Number.isFinite(weight.value) && weight.value > 0 ? weight.value : 0));
const v = computed(() => (Number.isFinite(volume.value) && volume.value > 0 ? volume.value : 0));

const hasInput = computed(() => w.value > 0 || v.value > 0);

const byWeight = computed(() => w.value * WEIGHT_RATE);
const byVolume = computed(() => v.value * VOLUME_RATE);

// Плотность груза (кг/м³); null, если объём не указан
const density = computed(() => (v.value > 0 ? w.value / v.value : null));

// Если чекбокс отмечен — считаем строго по объёму (кубатуре).
// Если нет — автоматически: реактивно берём большую из двух стоимостей
// (что эквивалентно правилу «меньше 200 кг в кубе → по объёму»).
const useVolume = computed(() =>
  forceVolume.value ? true : byVolume.value > byWeight.value,
);

const total = computed(() => (useVolume.value ? byVolume.value : byWeight.value));

const numberFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const fmt = (n: number) => numberFmt.format(Math.round(n));
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-16">
    <h1 class="text-3xl font-bold sm:text-4xl">{{ t('calculator.title') }}</h1>
    <p class="mt-3 text-steel-600 dark:text-steel-300">{{ t('calculator.subtitle') }}</p>

    <div
      class="mt-8 rounded-2xl border border-steel-200 bg-steel-50 p-6 dark:border-steel-800 dark:bg-steel-900/40"
    >
      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField :label="`${t('calculator.weight')}, ${t('calculator.weightUnit')}`" name="weight">
          <UInputNumber
            v-model="weight"
            :min="0"
            :step="1"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="`${t('calculator.volume')}, ${t('calculator.volumeUnit')}`" name="volume">
          <UInputNumber
            v-model="volume"
            :min="0"
            :step="0.1"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Тарифы -->
      <div class="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-steel-600 dark:text-steel-300">
        <span>{{ t('calculator.rateWeight') }}</span>
        <span>{{ t('calculator.rateVolume') }}</span>
      </div>

      <!-- Режим расчёта -->
      <UCheckbox
        v-model="forceVolume"
        :label="t('calculator.lessThan200')"
        class="mt-5"
      />

      <!-- Результат -->
      <div
        class="mt-6 rounded-xl border border-steel-200 bg-white p-5 dark:border-steel-800 dark:bg-steel-950"
      >
        <template v-if="hasInput">
          <p class="text-sm text-steel-500">{{ t('calculator.result') }}</p>
          <p class="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
            {{ fmt(total) }} <span class="text-xl font-semibold">{{ t('calculator.som') }}</span>
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            >
              <UIcon
                :name="useVolume ? 'i-lucide-box' : 'i-lucide-weight'"
                class="size-4"
              />
              {{ useVolume ? t('calculator.byVolume') : t('calculator.byWeight') }}
            </span>
            <span v-if="density !== null" class="text-sm text-steel-500">
              {{ t('calculator.density') }}: {{ numberFmt.format(Math.round(density)) }}
              {{ t('calculator.densityUnit') }}
            </span>
          </div>
        </template>

        <p v-else class="text-steel-500">{{ t('calculator.enterValues') }}</p>
      </div>

      <p class="mt-4 text-sm text-steel-500">{{ t('calculator.note') }}</p>

      <UButton
        :to="botUrl"
        target="_blank"
        size="lg"
        icon="i-lucide-send"
        color="primary"
        class="mt-6"
      >
        {{ t('calculator.cta') }}
      </UButton>
    </div>
  </section>
</template>
