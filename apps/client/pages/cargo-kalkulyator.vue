<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

// Номер WhatsApp для оформления заявки из калькулятора.
const WHATSAPP_PHONE = '996552165165';

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
const useVolume = computed(() => (forceVolume.value ? true : byVolume.value > byWeight.value));

const total = computed(() => (useVolume.value ? byVolume.value : byWeight.value));

const numberFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const fmt = (n: number) => numberFmt.format(Math.round(n));

const requestUrl = computed(() => {
  const query: Record<string, string> = {};
  if (w.value > 0) query.weight = String(w.value);
  if (v.value > 0) query.volume = String(v.value);
  return { path: localePath('/account/requests/new'), query };
});

// Ссылка на чат в WhatsApp с данными расчёта, готовыми к отправке менеджеру.
const orderUrl = computed(() => {
  const params = new URLSearchParams({
    phone: WHATSAPP_PHONE,
    type: 'phone_number',
    app_absent: '0',
  });

  if (hasInput.value) {
    const wKg = Math.round(w.value);
    const vM3 = Math.round(v.value * 100) / 100;
    const mode = useVolume.value ? t('calculator.byVolume') : t('calculator.byWeight');
    const message = [
      t('calculator.title'),
      `${t('calculator.weight')}: ${wKg} ${t('calculator.weightUnit')}`,
      `${t('calculator.volume')}: ${vM3} ${t('calculator.volumeUnit')}`,
      mode,
      `${t('calculator.result')}: ${fmt(total.value)} ${t('calculator.som')}`,
    ].join('\n');
    params.set('text', message);
  }

  return `https://api.whatsapp.com/send/?${params.toString()}`;
});
</script>

<template>
  <div>
    <!-- Шапка с фоновым фото -->
    <PageHero image="/backgrounds/kalkulyator.webp" max-width="max-w-3xl">
      <h1 class="text-3xl font-bold leading-tight text-white sm:text-4xl">
        {{ t('calculator.title') }}
      </h1>
      <p class="mt-3 max-w-xl text-white/80">{{ t('calculator.subtitle') }}</p>
    </PageHero>

    <section class="mx-auto w-full max-w-3xl px-4 py-12">
      <div
        class="rounded-brand-lg border border-steel-200 bg-white p-6 shadow-brand-card sm:p-8 dark:border-steel-800 dark:bg-steel-900/40"
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <UFormField :label="`${t('calculator.weight')}, ${t('calculator.weightUnit')}`" name="weight">
            <UInputNumber v-model="weight" :min="0" :step="1" size="lg" class="w-full" />
          </UFormField>

          <UFormField :label="`${t('calculator.volume')}, ${t('calculator.volumeUnit')}`" name="volume">
            <UInputNumber v-model="volume" :min="0" :step="0.1" size="lg" class="w-full" />
          </UFormField>
        </div>

        <!-- Тарифы -->
        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-steel-600 dark:text-steel-300">
          <span>{{ t('calculator.rateWeight') }}</span>
          <span>{{ t('calculator.rateVolume') }}</span>
        </div>

        <!-- Режим расчёта -->
        <UCheckbox v-model="forceVolume" :label="t('calculator.lessThan200')" class="mt-5" />

        <!-- Результат -->
        <div
          class="mt-6 rounded-brand-lg border border-brand-100 bg-brand-gradient-soft p-6 dark:border-steel-800"
        >
          <template v-if="hasInput">
            <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('calculator.result') }}</p>
            <p class="mt-1 text-4xl font-bold text-brand-gradient">
              {{ fmt(total) }} <span class="text-xl font-semibold text-brand-700 dark:text-brand-400">{{ t('calculator.som') }}</span>
            </p>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm dark:bg-steel-900 dark:text-brand-300"
              >
                <UIcon :name="useVolume ? 'i-lucide-box' : 'i-lucide-weight'" class="size-4" />
                {{ useVolume ? t('calculator.byVolume') : t('calculator.byWeight') }}
              </span>
              <span v-if="density !== null" class="text-sm text-steel-500 dark:text-steel-400">
                {{ t('calculator.density') }}: {{ numberFmt.format(Math.round(density)) }}
                {{ t('calculator.densityUnit') }}
              </span>
            </div>
          </template>

          <p v-else class="text-steel-500 dark:text-steel-400">{{ t('calculator.enterValues') }}</p>
        </div>

        <p class="mt-4 text-sm text-steel-500 dark:text-steel-400">{{ t('calculator.note') }}</p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <a
            :href="orderUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:brightness-110"
          >
            <UIcon name="i-lucide-send" class="size-5" />
            {{ t('calculator.cta') }}
          </a>
          <!-- Заявка в кабинете с уже введёнными весом и объёмом (без входа — через логин). -->
          <NuxtLink
            :to="requestUrl"
            class="inline-flex items-center gap-2 rounded-full border border-steel-300 px-6 py-3 font-semibold text-steel-700 transition hover:border-brand-400 hover:text-brand-600 dark:border-steel-700 dark:text-steel-200"
          >
            <UIcon name="i-lucide-clipboard-list" class="size-5" />
            {{ t('calculator.ctaRequest') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
