<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import type { Appeal, AppealCategory, MyParcel } from '~/types/api';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const api = useApi();
const toast = useToast();

const CATEGORIES: AppealCategory[] = ['damage', 'loss', 'delay', 'payment', 'other'];
const NO_PARCEL = 'none';

const { data: parcels } = await useAsyncData(
  'account-appeal-parcels',
  () => api.get<MyParcel[]>('/account/parcels'),
  {
    server: false,
    default: () => [],
  },
);

const parcelItems = computed(() => [
  { label: t('account.appeals.form.noParcel'), value: NO_PARCEL },
  ...parcels.value.map((p) => ({
    label: p.description ? `${p.trackNumber} — ${p.description}` : p.trackNumber,
    value: p.id,
  })),
]);

const required = t('account.appeals.form.errRequired');
const schema = toTypedSchema(
  z.object({
    category: z.enum(['damage', 'loss', 'delay', 'payment', 'other']),
    parcelId: z.string(),
    subject: z.string().trim().min(1, required).max(200),
    message: z.string().trim().min(1, required).max(5000),
  }),
);

// Со страницы посылки можно прийти с ?parcel=<id> — сразу привяжем её.
const { defineField, errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    category: 'other' as AppealCategory,
    parcelId: typeof route.query.parcel === 'string' ? route.query.parcel : NO_PARCEL,
    subject: '',
    message: '',
  },
});
const [category] = defineField('category');
const [parcelId] = defineField('parcelId');
const [subject, subjectAttrs] = defineField('subject');
const [message, messageAttrs] = defineField('message');

const submitting = ref(false);
const submitError = ref<string | null>(null);

const onSubmit = handleSubmit(async (v) => {
  submitting.value = true;
  submitError.value = null;
  try {
    const created = await api.post<Appeal>('/account/appeals', {
      category: v.category,
      subject: v.subject,
      message: v.message,
      parcelId: v.parcelId === NO_PARCEL ? null : v.parcelId,
    });
    toast.add({
      title: t('account.appeals.form.created', { number: created.number }),
      color: 'success',
      icon: 'i-lucide-check',
    });
    await navigateTo(localePath(`/account/appeals/${created.id}`));
  } catch {
    submitError.value = t('account.appeals.form.errSubmit');
  } finally {
    submitting.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink
        :to="localePath('/account/appeals')"
        class="inline-block text-sm font-medium text-steel-500 hover:text-brand-600 dark:text-steel-400"
      >
        {{ t('account.appeals.detail.back') }}
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-bold sm:text-3xl">{{ t('account.appeals.new') }}</h1>
    </div>

    <form
      class="space-y-5 rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50"
      @submit="onSubmit"
    >
      <UFormField :label="t('account.appeals.form.category')">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in CATEGORIES"
            :key="c"
            type="button"
            class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
            :class="
              category === c
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-steel-200 bg-white text-steel-600 hover:border-brand-300 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-300'
            "
            @click="category = c"
          >
            {{ t(`account.appeals.category.${c}`) }}
          </button>
        </div>
      </UFormField>

      <UFormField :label="t('account.appeals.form.parcel')">
        <USelectMenu v-model="parcelId" :items="parcelItems" value-key="value" size="lg" class="w-full sm:max-w-md" />
      </UFormField>

      <UFormField :label="t('account.appeals.form.subject')" :error="errors.subject">
        <UInput v-model="subject" v-bind="subjectAttrs" size="lg" class="w-full" />
      </UFormField>

      <UFormField :label="t('account.appeals.form.message')" :error="errors.message">
        <UTextarea
          v-model="message"
          v-bind="messageAttrs"
          :placeholder="t('account.appeals.form.messagePlaceholder')"
          :rows="6"
          class="w-full"
        />
      </UFormField>

      <div class="flex flex-wrap items-center gap-3">
        <UButton type="submit" size="lg" :loading="submitting" icon="i-lucide-send">
          {{ t('account.appeals.form.submit') }}
        </UButton>
        <p v-if="submitError" class="text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
      </div>
    </form>
  </div>
</template>
