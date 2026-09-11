<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { ApiError } from '~/composables/useApi';
import type { TelegramAuthData } from '~/types/api';
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const config = useRuntimeConfig();
const auth = useAuthStore();

const botUsername = String(config.public.telegramBotUsername ?? '');

useHead({ title: t('auth.loginTitle') });

const errorMessage = ref<string | null>(null);
const loading = ref(false);

const schema = toTypedSchema(
  z.object({
    email: z.string().email(t('auth.errEmail')),
    password: z.string().min(1, t('auth.errPasswordRequired')),
  }),
);
const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema });
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

function redirectAfterAuth(): Promise<unknown> {
  const raw = typeof route.query.redirect === 'string' ? route.query.redirect : null;
  // Разрешаем только внутренние относительные пути (защита от open-redirect).
  const target = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : null;
  return navigateTo(target ?? localePath('/account'));
}

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = null;
  loading.value = true;
  try {
    await auth.login(values.email, values.password);
    await redirectAfterAuth();
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError && error.status === 401
        ? t('auth.errInvalidCredentials')
        : t('auth.errNetwork');
  } finally {
    loading.value = false;
  }
});

async function onTelegram(data: TelegramAuthData): Promise<void> {
  errorMessage.value = null;
  try {
    await auth.loginWithTelegram(data);
    await redirectAfterAuth();
  } catch {
    errorMessage.value = t('auth.errProvider');
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-md px-4 py-14 sm:py-20">
    <div class="rounded-brand-lg border border-steel-200 bg-white p-6 shadow-brand-card sm:p-8 dark:border-steel-800 dark:bg-steel-900/50">
    <h1 class="mb-1 text-2xl font-semibold">{{ t('auth.loginTitle') }}</h1>
    <p class="mb-6 text-sm text-steel-500 dark:text-steel-400">{{ t('auth.loginSubtitle') }}</p>

    <form class="flex flex-col gap-4" @submit="onSubmit">
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
          autocomplete="current-password"
          class="w-full"
        />
      </UFormField>

      <p v-if="errorMessage" class="text-sm text-error-500 dark:text-error-400">
        {{ errorMessage }}
      </p>

      <UButton type="submit" :loading="loading" block class="justify-center">
        {{ t('auth.loginButton') }}
      </UButton>
    </form>

    <p class="mt-4 text-center text-sm text-steel-500 dark:text-steel-400">
      {{ t('auth.noAccount') }}
      <NuxtLink :to="localePath('/register')" class="text-brand-600 hover:underline dark:text-brand-400">
        {{ t('auth.registerLink') }}
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
  </div>
</template>
