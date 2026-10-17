<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import type { UserAddress, UserAddressPayload } from '~/types/api';

/** Создание/редактирование записи адресной книги. */
const props = defineProps<{ address: UserAddress | null; saving: boolean; error: string | null }>();
const emit = defineEmits<{ submit: [payload: UserAddressPayload] }>();
const open = defineModel<boolean>('open', { required: true });

const { t } = useI18n();

const schema = toTypedSchema(
  z.object({
    label: z.string().trim().min(1, t('account.requests.form.errRequired')).max(100),
    contactName: z.string().trim().min(1, t('account.requests.form.errRequired')).max(150),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$/, t('account.requests.form.errPhone')),
    city: z.string().trim().min(1, t('account.requests.form.errRequired')).max(100),
    address: z.string().trim().min(1, t('account.requests.form.errRequired')).max(500),
    comment: z.string().trim().max(1000),
    isDefault: z.boolean(),
  }),
);

const { defineField, errors, handleSubmit, resetForm } = useForm({ validationSchema: schema });
const [label, labelAttrs] = defineField('label');
const [contactName, contactNameAttrs] = defineField('contactName');
const [phone, phoneAttrs] = defineField('phone');
const [city, cityAttrs] = defineField('city');
const [address, addressAttrs] = defineField('address');
const [comment, commentAttrs] = defineField('comment');
const [isDefault] = defineField('isDefault');

// При каждом открытии заполняем форму редактируемым адресом или пустыми значениями.
watch(open, (value) => {
  if (!value) return;
  const a = props.address;
  resetForm({
    values: {
      label: a?.label ?? '',
      contactName: a?.contactName ?? '',
      phone: a?.phone ?? '',
      city: a?.city ?? '',
      address: a?.address ?? '',
      comment: a?.comment ?? '',
      isDefault: a?.isDefault ?? false,
    },
  });
});

const onSubmit = handleSubmit((values) => {
  emit('submit', { ...values, comment: values.comment || null });
});
</script>

<template>
  <UModal
    v-model:open="open"
    :title="address ? t('account.addresses.edit') : t('account.addresses.add')"
  >
    <template #body>
      <form id="address-form" class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <UFormField :label="t('account.addresses.label')" :error="errors.label" class="sm:col-span-2">
          <UInput
            v-model="label"
            v-bind="labelAttrs"
            :placeholder="t('account.addresses.labelPlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('account.addresses.contactName')" :error="errors.contactName">
          <UInput v-model="contactName" v-bind="contactNameAttrs" autocomplete="name" class="w-full" />
        </UFormField>
        <UFormField :label="t('account.addresses.phone')" :error="errors.phone">
          <UInput
            v-model="phone"
            v-bind="phoneAttrs"
            type="tel"
            autocomplete="tel"
            placeholder="+996 555 123 456"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('account.addresses.city')" :error="errors.city">
          <UInput v-model="city" v-bind="cityAttrs" autocomplete="address-level2" class="w-full" />
        </UFormField>
        <UFormField :label="t('account.addresses.address')" :error="errors.address">
          <UInput v-model="address" v-bind="addressAttrs" autocomplete="street-address" class="w-full" />
        </UFormField>
        <UFormField :label="t('account.addresses.comment')" :error="errors.comment" class="sm:col-span-2">
          <UTextarea v-model="comment" v-bind="commentAttrs" :rows="2" class="w-full" />
        </UFormField>
        <UCheckbox v-model="isDefault" :label="t('account.addresses.makeDefault')" class="sm:col-span-2" />
        <p v-if="error" class="text-sm text-red-600 sm:col-span-2 dark:text-red-400">{{ error }}</p>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          {{ t('account.addresses.cancel') }}
        </UButton>
        <UButton type="submit" form="address-form" :loading="saving">
          {{ t('account.addresses.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
