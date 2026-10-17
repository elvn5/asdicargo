<script setup lang="ts">
import type { DocumentRequest, DocumentType } from '~/types/api';

const { t, locale } = useI18n();
const api = useApi();
const toast = useToast();
const config = useRuntimeConfig();

const TYPES: DocumentType[] = ['invoice', 'reconciliation', 'other'];

const {
  data: documents,
  status,
  refresh,
} = await useAsyncData(
  'account-documents',
  () => api.get<DocumentRequest[]>('/account/documents'),
  { server: false, default: () => [] },
);

const dateLocale = computed(() => (locale.value === 'en' ? 'en-GB' : 'ru-RU'));

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(dateLocale.value);
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '';
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Скачивание — обычная ссылка на API: cookie сессии уходит вместе с переходом.
function downloadUrl(doc: DocumentRequest): string {
  return `${config.public.apiBaseUrl}/account/documents/${doc.id}/file`;
}

// ---------------- Заказ документа ----------------
const modalOpen = ref(false);
const form = reactive({
  type: 'invoice' as DocumentType,
  periodFrom: '',
  periodTo: '',
  comment: '',
});
const formError = ref<string | null>(null);
const saving = ref(false);

function openOrder(): void {
  Object.assign(form, { type: 'invoice', periodFrom: '', periodTo: '', comment: '' });
  formError.value = null;
  modalOpen.value = true;
}

async function submit(): Promise<void> {
  formError.value = null;
  if (form.type === 'reconciliation' && (!form.periodFrom || !form.periodTo)) {
    formError.value = t('account.documents.form.errPeriod');
    return;
  }
  if (form.periodFrom && form.periodTo && form.periodFrom > form.periodTo) {
    formError.value = t('account.documents.form.errOrder');
    return;
  }
  saving.value = true;
  try {
    await api.post('/account/documents', {
      type: form.type,
      periodFrom: form.periodFrom || null,
      periodTo: form.periodTo || null,
      comment: form.comment,
    });
    modalOpen.value = false;
    toast.add({
      title: t('account.documents.form.created'),
      color: 'success',
      icon: 'i-lucide-check',
    });
    await refresh();
  } catch {
    formError.value = t('account.documents.form.errSubmit');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.documents.title') }}</h1>
        <p class="mt-1 max-w-2xl text-steel-500 dark:text-steel-400">{{ t('account.documents.sub') }}</p>
      </div>
      <UButton icon="i-lucide-file-plus" @click="openOrder">{{ t('account.documents.order') }}</UButton>
    </div>

    <div
      v-if="status === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="status === 'pending' || status === 'idle'" class="space-y-3">
      <USkeleton v-for="n in 2" :key="n" class="h-24 w-full rounded-brand-lg" />
    </div>

    <ul v-else-if="documents.length" class="space-y-3">
      <li
        v-for="d in documents"
        :key="d.id"
        class="flex flex-wrap items-center gap-4 rounded-brand-lg border border-steel-200 bg-white p-4 dark:border-steel-800 dark:bg-steel-900/50"
      >
        <div
          class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
        >
          <UIcon :name="DOCUMENT_STATUS_META[d.status].icon" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-semibold">
            {{ t(`account.documents.type.${d.type}`) }}
            <span class="font-normal text-steel-400">{{ t('account.documents.number', { number: d.number }) }}</span>
          </p>
          <p class="mt-0.5 text-sm text-steel-500 dark:text-steel-400">
            <template v-if="d.periodFrom && d.periodTo">
              {{ t('account.documents.period', { from: formatDate(d.periodFrom), to: formatDate(d.periodTo) }) }} ·
            </template>
            {{ formatDate(d.createdAt) }}
          </p>
          <p v-if="d.managerComment" class="mt-1 text-sm text-steel-600 dark:text-steel-300">
            <span class="text-steel-400">{{ t('account.documents.managerComment') }}:</span> {{ d.managerComment }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <UBadge
            :color="DOCUMENT_STATUS_META[d.status].color"
            variant="subtle"
            class="rounded-full"
          >
            {{ t(`account.documents.status.${d.status}`) }}
          </UBadge>
          <UButton
            v-if="d.status === 'ready'"
            :to="downloadUrl(d)"
            external
            target="_blank"
            size="sm"
            icon="i-lucide-download"
          >
            {{ t('account.documents.download') }}
            <span v-if="d.fileSize" class="text-xs opacity-75">· {{ formatSize(d.fileSize) }}</span>
          </UButton>
        </div>
      </li>
    </ul>

    <div v-else class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700">
      <UIcon name="i-lucide-files" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ t('account.documents.empty') }}</p>
      <UButton class="mt-4" size="sm" icon="i-lucide-file-plus" @click="openOrder">{{ t('account.documents.order') }}</UButton>
    </div>

    <UModal v-model:open="modalOpen" :title="t('account.documents.order')">
      <template #body>
        <form id="document-form" class="space-y-4" @submit.prevent="submit">
          <UFormField :label="t('account.documents.form.type')">
            <div class="grid gap-2 sm:grid-cols-3">
              <button
                v-for="type in TYPES"
                :key="type"
                type="button"
                class="rounded-xl border px-3 py-2.5 text-sm font-medium transition"
                :class="
                  form.type === type
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'border-steel-200 text-steel-600 hover:border-brand-300 dark:border-steel-700 dark:text-steel-300'
                "
                @click="form.type = type"
              >
                {{ t(`account.documents.type.${type}`) }}
              </button>
            </div>
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField :label="t('account.documents.form.periodFrom')">
              <UInput v-model="form.periodFrom" type="date" :max="form.periodTo || undefined" class="w-full" />
            </UFormField>
            <UFormField :label="t('account.documents.form.periodTo')">
              <UInput v-model="form.periodTo" type="date" :min="form.periodFrom || undefined" class="w-full" />
            </UFormField>
          </div>
          <UFormField :label="t('account.documents.form.comment')">
            <UTextarea
              v-model="form.comment"
              :placeholder="t('account.documents.form.commentPlaceholder')"
              :rows="2"
              class="w-full"
            />
          </UFormField>
          <p class="text-xs text-steel-500 dark:text-steel-400">{{ t('account.documents.hint') }}</p>
          <p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="modalOpen = false">{{ t('account.documents.form.cancel') }}</UButton>
          <UButton type="submit" form="document-form" :loading="saving">{{ t('account.documents.form.submit') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
