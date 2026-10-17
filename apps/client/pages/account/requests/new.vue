<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { useAuthStore } from '~/stores/auth';
import type {
  ShipmentDirection,
  ShipmentRequest,
  ShipmentRequestPayload,
  UserAddress,
} from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const api = useApi();
const auth = useAuthStore();
const toast = useToast();

const DIRECTIONS: ShipmentDirection[] = ['kg_ru', 'ru_kg'];

// Адресная книга — для быстрого заполнения получателя и адреса забора.
const { data: book } = await useAsyncData(
  'account-addresses',
  () => api.get<UserAddress[]>('/account/addresses'),
  {
    server: false,
    default: () => [],
  },
);

const required = t('account.requests.form.errRequired');

const schema = toTypedSchema(
  z
    .object({
      direction: z.enum(['kg_ru', 'ru_kg']),
      fromCity: z.string().trim().min(1, required).max(100),
      toCity: z.string().trim().min(1, required).max(100),
      cargoDescription: z.string().trim().min(1, required).max(1000),
      weightKg: z
        .number({ invalid_type_error: t('account.requests.form.errWeight') })
        .positive(t('account.requests.form.errWeight'))
        .max(20_000),
      volumeM3: z.number().min(0).max(100).nullable(),
      pickupRequired: z.boolean(),
      pickupAddress: z.string().trim().max(500),
      recipientName: z.string().trim().min(1, required).max(150),
      recipientPhone: z
        .string()
        .trim()
        .regex(/^\+?[\d\s()-]{7,20}$/, t('account.requests.form.errPhone')),
      recipientAddress: z.string().trim().min(1, required).max(500),
      comment: z.string().trim().max(1000),
    })
    .refine((v) => !v.pickupRequired || v.pickupAddress.length > 0, {
      message: required,
      path: ['pickupAddress'],
    }),
);

// Вес/объём можно передать из поиска: /account/requests/new?weight=10&volume=0.2
function queryNumber(key: string): number | null {
  const raw = Number(route.query[key]);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

function queryText(key: string): string | null {
  const raw = route.query[key];
  return typeof raw === 'string' && raw.trim() ? raw.trim().slice(0, 1000) : null;
}

// Из поиска на сайте приходят направление, города, забор груза и список мест.
const queryDirection: ShipmentDirection = route.query.direction === 'ru_kg' ? 'ru_kg' : 'kg_ru';

const defaultAddress = computed(() => book.value.find((a) => a.isDefault) ?? null);

const { defineField, errors, handleSubmit, setValues, values } = useForm({
  validationSchema: schema,
  initialValues: {
    direction: queryDirection,
    fromCity: queryText('from') ?? (queryDirection === 'kg_ru' ? 'Бишкек' : ''),
    toCity: queryText('to') ?? (queryDirection === 'ru_kg' ? 'Бишкек' : ''),
    cargoDescription: '',
    weightKg: queryNumber('weight') ?? undefined,
    volumeM3: queryNumber('volume'),
    pickupRequired: route.query.pickup === '1',
    pickupAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    comment: queryText('comment') ?? '',
  },
});

const [direction] = defineField('direction');
const [fromCity, fromCityAttrs] = defineField('fromCity');
const [toCity, toCityAttrs] = defineField('toCity');
const [cargoDescription, cargoDescriptionAttrs] = defineField('cargoDescription');
const [weightKg] = defineField('weightKg');
const [volumeM3] = defineField('volumeM3');
const [pickupRequired] = defineField('pickupRequired');
const [pickupAddress, pickupAddressAttrs] = defineField('pickupAddress');
const [recipientName, recipientNameAttrs] = defineField('recipientName');
const [recipientPhone, recipientPhoneAttrs] = defineField('recipientPhone');
const [recipientAddress, recipientAddressAttrs] = defineField('recipientAddress');
const [comment, commentAttrs] = defineField('comment');

// Смена направления меняет города отправления и назначения местами.
watch(direction, (next, prev) => {
  if (next === prev) return;
  setValues({ fromCity: values.toCity ?? '', toCity: values.fromCity ?? '' }, false);
});

function fillFromAddress(address: UserAddress): void {
  setValues(
    {
      recipientName: address.contactName,
      recipientPhone: address.phone,
      recipientAddress: `${address.city}, ${address.address}`,
    },
    false,
  );
}

// Подставляем адрес по умолчанию — книга может прийти и до, и после setup.
watch(
  defaultAddress,
  (address) => {
    if (address && !values.recipientName && !values.recipientAddress) fillFromAddress(address);
  },
  { immediate: true },
);

function fillMe(): void {
  setValues(
    {
      recipientName: [auth.user?.firstName, auth.user?.lastName].filter(Boolean).join(' '),
      recipientPhone: auth.user?.phone ?? '',
    },
    false,
  );
}

const bookItems = computed(() =>
  book.value.map((a) => ({ label: `${a.label} — ${a.contactName}, ${a.city}`, value: a.id })),
);
const selectedBookId = ref<string | undefined>(undefined);
watch(selectedBookId, (id) => {
  const address = book.value.find((a) => a.id === id);
  if (address) fillFromAddress(address);
});

const estimate = computed(() =>
  estimateShipping(Number(weightKg.value ?? 0), Number(volumeM3.value ?? 0)),
);
const numberFmt = computed(() => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'ru-RU'));

const submitting = ref(false);
const submitError = ref<string | null>(null);

const onSubmit = handleSubmit(async (v) => {
  submitting.value = true;
  submitError.value = null;
  try {
    const payload: ShipmentRequestPayload = {
      ...v,
      volumeM3: v.volumeM3 && v.volumeM3 > 0 ? v.volumeM3 : null,
      pickupAddress: v.pickupRequired ? v.pickupAddress : null,
      comment: v.comment || null,
    };
    const created = await api.post<ShipmentRequest>('/account/requests', payload);
    toast.add({
      title: t('account.requests.form.created', { number: created.number }),
      color: 'success',
      icon: 'i-lucide-check',
    });
    await navigateTo(localePath(`/account/requests/${created.id}`));
  } catch {
    submitError.value = t('account.requests.form.errSubmit');
  } finally {
    submitting.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink
        :to="localePath('/account/requests')"
        class="inline-block text-sm font-medium text-steel-500 hover:text-brand-600 dark:text-steel-400"
      >
        {{ t('account.requests.detail.back') }}
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-bold sm:text-3xl">{{ t('account.requests.new') }}</h1>
      <p class="mt-1 text-steel-500 dark:text-steel-400">{{ t('account.requests.newSub') }}</p>
    </div>

    <form class="grid gap-6 xl:grid-cols-[1fr_20rem]" @submit="onSubmit">
      <div class="space-y-6">
        <!-- Маршрут -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <h2 class="mb-4 font-semibold">{{ t('account.requests.steps.route') }}</h2>
          <div class="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-steel-100 p-1 dark:bg-steel-800/60">
            <button
              v-for="d in DIRECTIONS"
              :key="d"
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-medium transition"
              :class="
                direction === d
                  ? 'bg-white text-brand-700 shadow-sm dark:bg-steel-900 dark:text-brand-300'
                  : 'text-steel-600 dark:text-steel-300'
              "
              @click="direction = d"
            >
              {{ t(`account.requests.direction.${d}`) }}
            </button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="t('account.requests.form.fromCity')" :error="errors.fromCity">
              <UInput v-model="fromCity" v-bind="fromCityAttrs" size="lg" class="w-full" />
            </UFormField>
            <UFormField :label="t('account.requests.form.toCity')" :error="errors.toCity">
              <UInput v-model="toCity" v-bind="toCityAttrs" size="lg" class="w-full" />
            </UFormField>
          </div>
        </section>

        <!-- Груз -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <h2 class="mb-4 font-semibold">{{ t('account.requests.steps.cargo') }}</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField
              :label="t('account.requests.form.cargoDescription')"
              :error="errors.cargoDescription"
              class="sm:col-span-2"
            >
              <UInput
                v-model="cargoDescription"
                v-bind="cargoDescriptionAttrs"
                :placeholder="t('account.requests.form.cargoPlaceholder')"
                size="lg"
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('account.requests.form.weight')" :error="errors.weightKg">
              <UInputNumber v-model="weightKg" :min="0" :step="1" size="lg" class="w-full" />
            </UFormField>
            <UFormField :label="t('account.requests.form.volume')" :error="errors.volumeM3">
              <UInputNumber
                v-model="volumeM3"
                :min="0"
                :step="0.1"
                :format-options="{ maximumFractionDigits: 3 }"
                size="lg"
                class="w-full"
              />
            </UFormField>
          </div>
        </section>

        <!-- Забор груза -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <h2 class="mb-4 font-semibold">{{ t('account.requests.steps.pickup') }}</h2>
          <USwitch v-model="pickupRequired" :label="t('account.requests.form.pickupRequired')" />
          <UFormField
            v-if="pickupRequired"
            :label="t('account.requests.form.pickupAddress')"
            :error="errors.pickupAddress"
            class="mt-4"
          >
            <UTextarea v-model="pickupAddress" v-bind="pickupAddressAttrs" :rows="2" class="w-full" />
          </UFormField>
          <p v-else class="mt-3 text-sm text-steel-500 dark:text-steel-400">
            {{ t('account.requests.form.pickupHint') }}
            <NuxtLink :to="localePath('/account/points')" class="font-medium text-brand-600 hover:underline dark:text-brand-400">
              {{ t('account.nav.points') }} →
            </NuxtLink>
          </p>
        </section>

        <!-- Получатель -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">{{ t('account.requests.steps.recipient') }}</h2>
            <div class="flex flex-wrap gap-2">
              <USelectMenu
                v-if="bookItems.length"
                v-model="selectedBookId"
                :items="bookItems"
                value-key="value"
                :placeholder="t('account.requests.form.fromBook')"
                :search-input="false"
                icon="i-lucide-book-user"
                size="sm"
                class="w-56"
              />
              <UButton size="sm" variant="soft" color="neutral" icon="i-lucide-user-round" @click="fillMe">
                {{ t('account.requests.form.fillMe') }}
              </UButton>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField :label="t('account.requests.form.recipientName')" :error="errors.recipientName">
              <UInput v-model="recipientName" v-bind="recipientNameAttrs" size="lg" class="w-full" />
            </UFormField>
            <UFormField :label="t('account.requests.form.recipientPhone')" :error="errors.recipientPhone">
              <UInput
                v-model="recipientPhone"
                v-bind="recipientPhoneAttrs"
                type="tel"
                placeholder="+7 900 123 45 67"
                size="lg"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('account.requests.form.recipientAddress')"
              :error="errors.recipientAddress"
              class="sm:col-span-2"
            >
              <UInput v-model="recipientAddress" v-bind="recipientAddressAttrs" size="lg" class="w-full" />
            </UFormField>
          </div>
        </section>

        <!-- Комментарий -->
        <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
          <UFormField :label="t('account.requests.form.comment')" :error="errors.comment">
            <UTextarea v-model="comment" v-bind="commentAttrs" :rows="3" class="w-full" />
          </UFormField>
        </section>
      </div>

      <!-- Итог -->
      <aside>
        <div
          class="space-y-4 rounded-brand-lg border border-brand-100 bg-brand-gradient-soft p-5 xl:sticky xl:top-28 dark:border-steel-800"
        >
          <div>
            <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('account.requests.form.estimate') }}</p>
            <p class="mt-1 text-3xl font-bold text-brand-gradient">
              {{ numberFmt.format(estimate.total) }}
              <span class="text-lg font-semibold text-brand-700 dark:text-brand-400">{{ t('account.parcel.som') }}</span>
            </p>
            <p v-if="estimate.total > 0" class="mt-1 text-sm text-steel-500 dark:text-steel-400">
              {{ estimate.useVolume ? t('calculator.byVolume') : t('calculator.byWeight') }}
            </p>
          </div>
          <p class="text-xs text-steel-500 dark:text-steel-400">{{ t('account.requests.form.estimateHint') }}</p>
          <UButton type="submit" block size="lg" :loading="submitting" icon="i-lucide-send">
            {{ t('account.requests.form.submit') }}
          </UButton>
          <p v-if="submitError" class="text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
        </div>
      </aside>
    </form>
  </div>
</template>
