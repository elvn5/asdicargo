<script setup lang="ts">
/** Добавление/редактирование «места» груза: габариты, вес, количество. */
import type { CargoPlace } from '~/utils/shippingCost';

// Порог «габаритного груза»: любая сторона длиннее или место тяжелее.
const OVERSIZE_SIDE_M = 1.5;
const OVERSIZE_WEIGHT_KG = 100;

const props = defineProps<{ place: CargoPlace | null }>();
const emit = defineEmits<{ save: [place: CargoPlace] }>();
const open = defineModel<boolean>('open', { required: true });

const { t } = useI18n();

// Пустые поля — null, чтобы в инпутах были видны подсказки, а не нули.
type PlaceForm = { [K in keyof CargoPlace]: K extends 'canLay' ? boolean : number | null };
const empty = (): PlaceForm => ({
  length: null,
  width: null,
  height: null,
  weight: null,
  count: 1,
  canLay: true,
});
const form = reactive<PlaceForm>(empty());
const error = ref<string | null>(null);

watch(open, (value) => {
  if (!value) return;
  Object.assign(form, props.place ?? empty());
  error.value = null;
});

const oversize = computed(
  () =>
    Math.max(form.length ?? 0, form.width ?? 0, form.height ?? 0) > OVERSIZE_SIDE_M ||
    (form.weight ?? 0) > OVERSIZE_WEIGHT_KG,
);

function save(): void {
  const { length, width, height, weight } = form;
  if (!(length && width && height && length > 0 && width > 0 && height > 0)) {
    error.value = t('search.placeForm.errDims');
    return;
  }
  if (!(weight && weight > 0)) {
    error.value = t('search.placeForm.errWeight');
    return;
  }
  emit('save', {
    length,
    width,
    height,
    weight,
    count: Math.max(1, Math.round(form.count ?? 1)),
    canLay: form.canLay,
  });
  open.value = false;
}
</script>

<template>
  <UModal v-model:open="open" :title="t('search.placeForm.title')">
    <template #body>
      <form id="place-form" class="space-y-4" @submit.prevent="save">
        <UFormField :label="t('search.placeForm.dims')">
          <div class="grid grid-cols-3 gap-2">
            <UInputNumber v-model="form.length" :min="0" :step="0.1" :format-options="{ maximumFractionDigits: 2 }" :increment="false" :decrement="false" :placeholder="t('search.placeForm.length')" :aria-label="t('search.placeForm.length')" />
            <UInputNumber v-model="form.width" :min="0" :step="0.1" :format-options="{ maximumFractionDigits: 2 }" :increment="false" :decrement="false" :placeholder="t('search.placeForm.width')" :aria-label="t('search.placeForm.width')" />
            <UInputNumber v-model="form.height" :min="0" :step="0.1" :format-options="{ maximumFractionDigits: 2 }" :increment="false" :decrement="false" :placeholder="t('search.placeForm.height')" :aria-label="t('search.placeForm.height')" />
          </div>
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="t('search.placeForm.weight')">
            <UInputNumber v-model="form.weight" :min="0" :step="1" class="w-full" />
          </UFormField>
          <UFormField :label="t('search.placeForm.count')">
            <UInputNumber v-model="form.count" :min="1" :step="1" class="w-full" />
          </UFormField>
        </div>
        <USwitch v-model="form.canLay" :label="t('search.placeForm.canLay')" />
        <div
          v-if="oversize"
          class="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
        >
          <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0" />
          {{ t('search.placeForm.oversize') }}
        </div>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </form>
    </template>
    <template #footer>
      <UButton type="submit" form="place-form" block size="lg">
        {{ place ? t('search.placeForm.save') : t('search.placeForm.add') }}
      </UButton>
    </template>
  </UModal>
</template>
