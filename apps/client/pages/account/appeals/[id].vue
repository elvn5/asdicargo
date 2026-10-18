<script setup lang="ts">
import { ApiError } from '~/composables/useApi';
import type { Appeal } from '~/types/api';

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const api = useApi();
const toast = useToast();

const id = computed(() => String(route.params.id));

const {
  data: appeal,
  status,
  error,
  refresh,
} = await useAsyncData(
  () => `account-appeal-${id.value}`,
  () => api.get<Appeal>(`/account/appeals/${id.value}`),
  { server: false },
);

const notFound = computed(
  () => error.value?.cause instanceof ApiError && [400, 404].includes(error.value.cause.status),
);

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const reply = ref('');
const sending = ref(false);
const thread = ref<HTMLElement | null>(null);

// Прокручиваем переписку к последнему сообщению.
watch(
  () => appeal.value?.messages?.length,
  async () => {
    await nextTick();
    thread.value?.scrollTo({ top: thread.value.scrollHeight });
  },
);

async function send(): Promise<void> {
  if (!appeal.value || !reply.value.trim()) return;
  sending.value = true;
  try {
    appeal.value = await api.post<Appeal>(`/account/appeals/${appeal.value.id}/messages`, {
      body: reply.value.trim(),
    });
    reply.value = '';
  } catch {
    toast.add({ title: t('account.appeals.form.errSubmit'), color: 'error' });
  } finally {
    sending.value = false;
  }
}

const closing = ref(false);

async function close(): Promise<void> {
  if (!appeal.value) return;
  if (!confirm(t('account.appeals.detail.closeConfirm', { number: appeal.value.number }))) return;
  closing.value = true;
  try {
    appeal.value = await api.post<Appeal>(`/account/appeals/${appeal.value.id}/close`);
  } catch {
    toast.add({ title: t('account.appeals.form.errSubmit'), color: 'error' });
  } finally {
    closing.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      :to="localePath('/account/appeals')"
      class="inline-block text-sm font-medium text-steel-500 hover:text-brand-600 dark:text-steel-400"
    >
      {{ t('account.appeals.detail.back') }}
    </NuxtLink>

    <div v-if="status === 'pending' || status === 'idle'" class="space-y-4">
      <USkeleton class="h-24 w-full rounded-brand-lg" />
      <USkeleton class="h-80 w-full rounded-brand-lg" />
    </div>

    <div
      v-else-if="status === 'error'"
      class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700"
    >
      <UIcon name="i-lucide-message-square-x" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ notFound ? t('account.appeals.detail.notFound') : t('account.loadError') }}</p>
      <UButton v-if="!notFound" class="mt-3" size="sm" variant="soft" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <template v-else-if="appeal">
      <section
        class="flex flex-wrap items-start justify-between gap-3 rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50"
      >
        <div class="min-w-0">
          <p class="text-sm text-steel-500 dark:text-steel-400">
            {{ t('account.appeals.number', { number: appeal.number }) }} · {{ t(`account.appeals.category.${appeal.category}`) }}
          </p>
          <h1 class="mt-1 text-xl font-bold sm:text-2xl">{{ appeal.subject }}</h1>
          <NuxtLink
            v-if="appeal.parcel"
            :to="localePath(`/account/parcels/${appeal.parcel.id}`)"
            class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            <UIcon name="i-lucide-package" class="size-4" />
            {{ t('account.appeals.detail.parcel') }} {{ appeal.parcel.trackNumber }}
          </NuxtLink>
        </div>
        <UBadge
          :color="APPEAL_STATUS_META[appeal.status].color"
          :icon="APPEAL_STATUS_META[appeal.status].icon"
          variant="subtle"
          class="rounded-full"
        >
          {{ t(`account.appeals.status.${appeal.status}`) }}
        </UBadge>
      </section>

      <!-- Переписка -->
      <section class="rounded-brand-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900/50">
        <div ref="thread" class="max-h-[32rem] space-y-4 overflow-y-auto p-5 sm:p-6">
          <div
            v-for="m in appeal.messages ?? []"
            :key="m.id"
            class="flex"
            :class="m.author === 'client' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]"
              :class="
                m.author === 'client'
                  ? 'rounded-br-md bg-brand-500 text-white'
                  : 'rounded-bl-md bg-steel-100 text-steel-800 dark:bg-steel-800 dark:text-steel-100'
              "
            >
              <p class="mb-1 text-xs font-medium" :class="m.author === 'client' ? 'text-white/75' : 'text-steel-500 dark:text-steel-400'">
                {{ m.author === 'client' ? t('account.appeals.detail.you') : t('account.appeals.detail.manager') }} ·
                {{ formatDateTime(m.createdAt) }}
              </p>
              <p class="whitespace-pre-line break-words text-sm">{{ m.body }}</p>
            </div>
          </div>
          <p v-if="appeal.status === 'open'" class="text-center text-xs text-steel-400">
            {{ t('account.appeals.detail.waiting') }}
          </p>
        </div>

        <div class="border-t border-steel-100 p-4 sm:p-5 dark:border-steel-800">
          <p v-if="appeal.status === 'closed'" class="text-sm text-steel-500 dark:text-steel-400">
            {{ t('account.appeals.detail.closed') }}
          </p>
          <form v-else class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="send">
            <UTextarea
              v-model="reply"
              :placeholder="t('account.appeals.detail.reply')"
              :rows="2"
              autoresize
              :maxrows="6"
              class="flex-1"
              @keydown.meta.enter="send"
              @keydown.ctrl.enter="send"
            />
            <UButton type="submit" icon="i-lucide-send" :loading="sending" :disabled="!reply.trim()">
              {{ t('account.appeals.detail.send') }}
            </UButton>
          </form>
        </div>
      </section>

      <UButton v-if="appeal.status !== 'closed'" color="neutral" variant="soft" icon="i-lucide-circle-check" :loading="closing" @click="close">
        {{ t('account.appeals.detail.close') }}
      </UButton>
    </template>
  </div>
</template>
