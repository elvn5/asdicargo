<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { ApiError } from '~/composables/useApi';
import type { TelegramAuthData } from '~/types/api';
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const auth = useAuthStore();

const botUsername = String(config.public.telegramBotUsername ?? '');

useHead({ title: t('auth.registerTitle') });

const errorMessage = ref<string | null>(null);
const loading = ref(false);

const schema = toTypedSchema(
  z
    .object({
      firstName: z.string().trim().min(1, t('auth.errNameRequired')),
      email: z.string().email(t('auth.errEmail')),
      password: z.string().min(8, t('auth.errPasswordMin')),
      passwordConfirm: z.string(),
    })
    .refine((v) => v.password === v.passwordConfirm, {
      message: t('auth.errPasswordMatch'),
      path: ['passwordConfirm'],
    }),
);
const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [firstName, firstNameAttrs] = defineField('firstName');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [passwordConfirm, passwordConfirmAttrs] = defineField('passwordConfirm');

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = null;
  loading.value = true;
  try {
    await auth.register({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
    });
    await navigateTo(localePath('/account'));
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError && error.status === 409
        ? t('auth.errEmailTaken')
        : t('auth.errNetwork');
  } finally {
    loading.value = false;
  }
});

async function onTelegram(data: TelegramAuthData): Promise<void> {
  errorMessage.value = null;
  try {
    await auth.loginWithTelegram(data);
    await navigateTo(localePath('/account'));
  } catch {
    errorMessage.value = t('auth.errProvider');
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col px-4 py-12">
    <h1 class="mb-1 text-2xl font-semibold">{{ t('auth.registerTitle') }}</h1>
    <p class="mb-6 text-sm text-steel-500 dark:text-steel-400">{{ t('auth.registerSubtitle') }}</p>

    <form class="flex flex-col gap-4" @submit="onSubmit">
      <UFormField :label="t('auth.firstName')" :error="errors.firstName">
        <UInput v-model="firstName" v-bind="firstNameAttrs" autocomplete="given-name" class="w-full" />
      </UFormField>

      <UFormField :label="t('auth.email')" :error="errors.email">
        <UInput
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.password')" :error="errors.password">
        <UInput
          v-model="password"
          v-bind="passwordAttrs"
          type="password"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.passwordConfirm')" :error="errors.passwordConfirm">
        <UInput
          v-model="passwordConfirm"
          v-bind="passwordConfirmAttrs"
          type="password"
          autocomplete="new-password"
          class="w-full"
        />
      </UFormField>

      <p v-if="errorMessage" class="text-sm text-error-500 dark:text-error-400">
        {{ errorMessage }}
      </p>

      <UButton type="submit" :loading="loading" block class="justify-center">
        {{ t('auth.registerButton') }}
      </UButton>
    </form>

    <p class="mt-4 text-center text-sm text-steel-500 dark:text-steel-400">
      {{ t('auth.haveAccount') }}
      <NuxtLink :to="localePath('/login')" class="text-brand-600 hover:underline dark:text-brand-400">
        {{ t('auth.loginLink') }}
      </NuxtLink>
    </p>

    <div v-if="botUsername" class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-steel-200 dark:bg-steel-800" />
      <span class="text-xs uppercase tracking-wider text-steel-400">{{ t('auth.or') }}</span>
      <span class="h-px flex-1 bg-steel-200 dark:bg-steel-800" />
    </div>

    <div class="flex flex-col items-center gap-3">
      <ClientOnly>
        <TelegramLoginButton
          v-if="botUsername"
          :bot-username="botUsername"
          @auth="onTelegram"
        />
      </ClientOnly>
    </div>
  </div>
</template>
