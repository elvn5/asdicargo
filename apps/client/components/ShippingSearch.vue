<script setup lang="ts">
/**
 * Поиск/расчёт перевозки «как в кабинете sibtrans»: откуда → куда, точные
 * параметры (места с габаритами) или просто вес/объём, забор груза у клиента.
 * Результат — предварительная стоимость по тарифу и переход к заявке.
 */
import type { CargoPlace } from '~/utils/shippingCost';

const props = withDefaults(defineProps<{ initialFrom?: string; initialTo?: string }>(), {
  initialFrom: '',
  initialTo: '',
});

const WHATSAPP_PHONE = '996552165165';

const { t, locale } = useI18n();
const localePath = useLocalePath();

const from = ref(props.initialFrom);
const to = ref(props.initialTo);
const exact = ref(false);
const pickup = ref(false);
const weight = ref<number | null>(null);
const volume = ref<number | null>(null);
const places = ref<CargoPlace[]>([]);

const pickerFor = ref<'from' | 'to' | null>(null);
const pickerOpen = computed({
  get: () => pickerFor.value !== null,
  set: (value: boolean) => {
    if (!value) pickerFor.value = null;
  },
});

const placeModalOpen = ref(false);
const editingIndex = ref<number | null>(null);

// Ошибки показываем только после попытки расчёта — как в оригинале.
const submitted = ref(false);

function swap(): void {
  [from.value, to.value] = [to.value, from.value];
}

function onPick(city: string): void {
  if (pickerFor.value === 'from') from.value = city;
  if (pickerFor.value === 'to') to.value = city;
}

function addPlace(): void {
  editingIndex.value = null;
  placeModalOpen.value = true;
}

function editPlace(index: number): void {
  editingIndex.value = index;
  placeModalOpen.value = true;
}

function onSavePlace(place: CargoPlace): void {
  if (editingIndex.value === null) places.value.push(place);
  else places.value.splice(editingIndex.value, 1, place);
}

function removePlace(index: number): void {
  places.value.splice(index, 1);
}

const totals = computed(() => {
  if (exact.value) return totalsOf(places.value);
  return { weight: weight.value ?? 0, volume: volume.value ?? 0, count: 0 };
});

const errors = computed(() => {
  const e: Partial<Record<'from' | 'to' | 'route' | 'cargo', string>> = {};
  if (!from.value) e.from = t('search.errFrom');
  if (!to.value) e.to = t('search.errTo');
  const a = from.value ? countryOf(from.value) : null;
  const b = to.value ? countryOf(to.value) : null;
  // Тариф — только между КР и РФ: оба города одной страны считать не можем.
  if (a && b && a === b) e.route = t('search.errRoute');
  if (exact.value && places.value.length === 0) e.cargo = t('search.errPlaces');
  if (!exact.value && !(totals.value.weight > 0 || totals.value.volume > 0))
    e.cargo = t('search.errWeight');
  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

const estimate = computed(() => estimateShipping(totals.value.weight, totals.value.volume));

const numberFmt = computed(
  () =>
    new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'ru-RU', { maximumFractionDigits: 2 }),
);
const fmt = (n: number): string => numberFmt.value.format(n);

function calculate(): void {
  submitted.value = true;
}

// Направление заявки по стране отправления (или назначения, если город введён вручную).
const direction = computed(() => {
  const a = countryOf(from.value);
  const b = countryOf(to.value);
  if (a === 'ru' || b === 'kg') return 'ru_kg';
  return 'kg_ru';
});

function placesSummary(): string {
  return places.value
    .map(
      (p, i) =>
        t('search.placeLine', {
          n: i + 1,
          count: p.count,
          l: fmt(p.length),
          w: fmt(p.width),
          h: fmt(p.height),
          weight: fmt(p.weight),
        }) + (p.canLay ? '' : ` (${t('search.placeForm.noLay')})`),
    )
    .join('\n');
}

const requestLink = computed(() => {
  const query: Record<string, string> = {
    direction: direction.value,
    from: from.value,
    to: to.value,
  };
  if (totals.value.weight > 0) query.weight = String(Math.round(totals.value.weight * 100) / 100);
  if (totals.value.volume > 0) query.volume = String(Math.round(totals.value.volume * 1000) / 1000);
  if (pickup.value) query.pickup = '1';
  if (exact.value && places.value.length) query.comment = placesSummary();
  return { path: localePath('/account/requests/new'), query };
});

const whatsappUrl = computed(() => {
  const lines = [
    `${t('search.title')}: ${from.value} → ${to.value}`,
    `${t('search.weight')}: ${fmt(totals.value.weight)}`,
    `${t('search.volume')}: ${fmt(totals.value.volume)}`,
    ...(exact.value ? [placesSummary()] : []),
    ...(pickup.value ? [t('search.pickup')] : []),
    `${t('search.result.title')}: ≈ ${fmt(estimate.value.total)} ${t('calculator.som')}`,
  ];
  const params = new URLSearchParams({
    phone: WHATSAPP_PHONE,
    type: 'phone_number',
    app_absent: '0',
    text: lines.join('\n'),
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
});
</script>

<template>
  <div class="rounded-brand-xl bg-brand-gradient p-4 text-white shadow-brand-card sm:p-6">
    <h2 class="mb-4 text-lg font-semibold sm:text-xl">{{ t('search.title') }}</h2>

    <!-- Откуда ⇄ Куда -->
    <div class="flex items-stretch overflow-hidden rounded-2xl bg-white text-steel-900 shadow-sm">
      <button
        type="button"
        class="min-w-0 flex-1 px-4 py-3.5 text-left"
        :aria-label="t('search.from')"
        @click="pickerFor = 'from'"
      >
        <span class="block text-xs text-steel-400">{{ t('search.from') }}</span>
        <span class="block truncate font-medium" :class="from ? '' : 'text-steel-400'">{{ from || '—' }}</span>
      </button>
      <button
        type="button"
        class="flex w-11 shrink-0 items-center justify-center border-x border-steel-100 text-steel-500 transition hover:bg-steel-50 hover:text-brand-600"
        :aria-label="t('search.swap')"
        @click="swap"
      >
        <UIcon name="i-lucide-arrow-left-right" class="size-5" />
      </button>
      <button
        type="button"
        class="min-w-0 flex-1 px-4 py-3.5 text-left"
        :aria-label="t('search.to')"
        @click="pickerFor = 'to'"
      >
        <span class="block text-xs text-steel-400">{{ t('search.to') }}</span>
        <span class="block truncate font-medium" :class="to ? '' : 'text-steel-400'">{{ to || '—' }}</span>
      </button>
    </div>
    <div v-if="submitted && (errors.from || errors.to || errors.route)" class="mt-1.5 grid grid-cols-2 gap-2 text-xs text-white/90">
      <template v-if="errors.route">
        <p class="col-span-2">{{ errors.route }}</p>
      </template>
      <template v-else>
        <p>{{ errors.from }}</p>
        <p>{{ errors.to }}</p>
      </template>
    </div>

    <!-- Переключатели -->
    <div class="mt-3 space-y-2">
      <label class="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 transition hover:bg-white/20">
        <USwitch v-model="exact" color="neutral" />
        <span class="text-sm font-medium">{{ t('search.exact') }}</span>
      </label>
      <label class="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 transition hover:bg-white/20">
        <USwitch v-model="pickup" color="neutral" />
        <span class="text-sm font-medium">{{ t('search.pickup') }}</span>
      </label>
    </div>

    <!-- Груз: места или вес/объём -->
    <div class="mt-3 space-y-2">
      <template v-if="exact">
        <div
          v-for="(p, i) in places"
          :key="i"
          class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-steel-900"
        >
          <UIcon name="i-lucide-box" class="size-5 shrink-0 text-brand-600" />
          <button type="button" class="min-w-0 flex-1 text-left text-sm" @click="editPlace(i)">
            <span class="font-medium">{{ t('search.place', { n: i + 1 }) }}</span>
            <span class="block truncate text-steel-500">
              {{ p.count }} × {{ fmt(p.length) }}×{{ fmt(p.width) }}×{{ fmt(p.height) }} {{ t('search.unitM') }} ·
              {{ fmt(p.weight) }} {{ t('calculator.weightUnit') }}
            </span>
          </button>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="t('search.placeForm.remove')"
            @click="removePlace(i)"
          />
        </div>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3.5 text-sm font-medium transition hover:bg-white/25"
          @click="addPlace"
        >
          <UIcon name="i-lucide-plus" class="size-5" />
          {{ t('search.addPlace') }}
        </button>
      </template>
      <template v-else>
        <UInputNumber
          v-model="weight"
          :min="0"
          :step="1"
          :placeholder="t('search.weight')"
          :aria-label="t('search.weight')"
          size="xl"
          class="w-full"
          :increment="false"
          :decrement="false"
          :ui="{ base: 'rounded-2xl bg-white px-4 py-3.5 text-left text-base text-steel-900 ring-0 placeholder:text-steel-400' }"
        />
        <UInputNumber
          v-model="volume"
          :min="0"
          :step="0.1"
          :format-options="{ maximumFractionDigits: 3 }"
          :placeholder="t('search.volume')"
          :aria-label="t('search.volume')"
          size="xl"
          class="w-full"
          :increment="false"
          :decrement="false"
          :ui="{ base: 'rounded-2xl bg-white px-4 py-3.5 text-left text-base text-steel-900 ring-0 placeholder:text-steel-400' }"
        />
      </template>
      <p v-if="submitted && errors.cargo" class="text-xs text-white/90">{{ errors.cargo }}</p>
    </div>

    <button
      type="button"
      class="mt-4 w-full rounded-2xl bg-steel-950 px-4 py-3.5 font-semibold text-white transition hover:bg-black"
      @click="calculate"
    >
      {{ t('search.calculate') }}
    </button>

    <!-- Результат -->
    <div v-if="submitted && isValid" class="mt-4 rounded-2xl bg-white p-4 text-steel-900 sm:p-5">
      <p class="text-sm text-steel-500">{{ t('search.result.title') }} · {{ from }} → {{ to }}</p>
      <p class="mt-1 text-3xl font-bold text-brand-gradient">
        ≈ {{ fmt(estimate.total) }} <span class="text-lg font-semibold text-brand-700">{{ t('calculator.som') }}</span>
      </p>
      <p class="mt-1 text-sm text-steel-500">
        {{ estimate.useVolume ? t('calculator.byVolume') : t('calculator.byWeight') }} ·
        {{ t('search.result.totals', { weight: fmt(totals.weight), volume: fmt(totals.volume) }) }}
      </p>
      <p v-if="pickup" class="mt-2 text-sm text-steel-600">{{ t('search.result.pickupNote') }}</p>
      <p class="mt-2 text-xs text-steel-400">{{ t('search.result.note') }}</p>
      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <UButton :to="requestLink" size="lg" icon="i-lucide-clipboard-list" class="justify-center">
          {{ t('search.result.order') }}
        </UButton>
        <UButton
          :to="whatsappUrl"
          target="_blank"
          external
          size="lg"
          color="neutral"
          variant="soft"
          icon="i-lucide-message-circle"
          class="justify-center"
        >
          {{ t('search.result.whatsapp') }}
        </UButton>
      </div>
    </div>

    <SearchCityPicker
      v-model:open="pickerOpen"
      :title="pickerFor === 'to' ? t('search.to') : t('search.from')"
      :exclude="pickerFor === 'to' ? from : to"
      @select="onPick"
    />
    <SearchPlaceModal
      v-model:open="placeModalOpen"
      :place="editingIndex === null ? null : (places[editingIndex] ?? null)"
      @save="onSavePlace"
    />
  </div>
</template>
