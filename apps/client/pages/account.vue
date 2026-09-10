<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({ middleware: 'auth' });

const { t } = useI18n();
const localePath = useLocalePath();
const auth = useAuthStore();

useHead({ title: t('auth.accountTitle') });

const loggingOut = ref(false);

async function onLogout(): Promise<void> {
  loggingOut.value = true;
  try {
    await auth.logout();
    await navigateTo(localePath('/'));
  } finally {
    loggingOut.value = false;
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 py-12">
    <h1 class="mb-6 text-2xl font-semibold">{{ t('auth.accountTitle') }}</h1>

    <div
      v-if="auth.user"
      class="rounded-xl border border-steel-200 bg-white p-6 dark:border-steel-800 dark:bg-steel-900"
    >
      <div class="flex items-center gap-4">
        <UAvatar
          :src="auth.user.avatarUrl ?? undefined"
          :alt="auth.displayName"
          size="lg"
          icon="i-lucide-user"
        />
        <div>
          <p class="text-lg font-medium">{{ auth.displayName }}</p>
          <p v-if="auth.user.email" class="text-sm text-steel-500 dark:text-steel-400">
            {{ auth.user.email }}
          </p>
        </div>
      </div>

      <dl class="mt-6 grid gap-3 text-sm">
        <div v-if="auth.user.username" class="flex justify-between border-t border-steel-100 pt-3 dark:border-steel-800">
          <dt class="text-steel-500 dark:text-steel-400">{{ t('auth.usernameLabel') }}</dt>
          <dd>@{{ auth.user.username }}</dd>
        </div>
        <div v-if="auth.user.telegramId" class="flex justify-between border-t border-steel-100 pt-3 dark:border-steel-800">
          <dt class="text-steel-500 dark:text-steel-400">Telegram</dt>
          <dd>{{ t('auth.connected') }}</dd>
        </div>
      </dl>

      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-log-out"
        class="mt-6"
        :loading="loggingOut"
        @click="onLogout"
      >
        {{ t('auth.logout') }}
      </UButton>
    </div>
  </div>
</template>
