<script setup lang="ts">
import { useApiClient } from '~/shared/api/client';
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_LABELS,
  type DocumentRequest,
  type DocumentRequestStatus,
} from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();
const config = useRuntimeConfig();
const items = ref<DocumentRequest[]>([]);
const loading = ref(false);
const statusFilter = ref<DocumentRequestStatus | 'all'>('pending');

const FILTERS = [{ value: 'all' as const, label: 'Все' }, ...DOCUMENT_STATUS_OPTIONS];
const MAX_SIZE = 10 * 1024 * 1024;

const selected = ref<DocumentRequest | null>(null);
const isModalOpen = ref(false);
const file = ref<File | null>(null);
const rejectComment = ref('');
const busy = ref(false);
const error = ref<string | null>(null);

function statusMeta(status: DocumentRequestStatus) {
  return (
    DOCUMENT_STATUS_OPTIONS.find((o) => o.value === status) ?? {
      value: status,
      label: status,
      color: 'info' as const,
    }
  );
}

function userLabel(item: DocumentRequest): string {
  const u = item.user;
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return (
    [name, u.email ?? (u.username ? `@${u.username}` : '')].filter(Boolean).join(' · ') || u.id
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU');
}

function fileUrl(item: DocumentRequest): string {
  return `${config.public.apiBaseUrl}/documents/${item.id}/file`;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const query = statusFilter.value === 'all' ? '' : `?status=${statusFilter.value}`;
    items.value = await api.get<DocumentRequest[]>(`/documents${query}`);
  } finally {
    loading.value = false;
  }
}

watch(statusFilter, load);

function open(item: DocumentRequest): void {
  selected.value = item;
  file.value = null;
  rejectComment.value = item.managerComment ?? '';
  error.value = null;
  isModalOpen.value = true;
}

function onFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;
  error.value = file.value && file.value.size > MAX_SIZE ? 'Файл больше 10 МБ' : null;
}

async function upload(): Promise<void> {
  if (!selected.value || !file.value || error.value) return;
  busy.value = true;
  try {
    await api.upload(`/documents/${selected.value.id}/file`, file.value);
    isModalOpen.value = false;
    await load();
  } catch (e) {
    error.value = e instanceof Error && e.message ? e.message : 'Не удалось загрузить файл';
  } finally {
    busy.value = false;
  }
}

async function reject(): Promise<void> {
  if (!selected.value || !rejectComment.value.trim()) {
    error.value = 'Укажите причину — клиент увидит её в кабинете';
    return;
  }
  busy.value = true;
  try {
    await api.put(`/documents/${selected.value.id}/reject`, {
      managerComment: rejectComment.value.trim(),
    });
    isModalOpen.value = false;
    await load();
  } catch {
    error.value = 'Не удалось сохранить';
  } finally {
    busy.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Заказы документов</h1>
      <div class="flex flex-wrap gap-1">
        <UButton
          v-for="f in FILTERS"
          :key="f.value"
          size="xs"
          :variant="statusFilter === f.value ? 'solid' : 'ghost'"
          :color="statusFilter === f.value ? 'primary' : 'neutral'"
          @click="statusFilter = f.value"
        >
          {{ f.label }}
        </UButton>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-950">
      <table class="w-full text-left text-sm">
        <thead class="bg-steel-50 text-steel-600 dark:bg-steel-900 dark:text-steel-300">
          <tr>
            <th class="px-4 py-2">№</th>
            <th class="px-4 py-2">Клиент</th>
            <th class="px-4 py-2">Документ</th>
            <th class="px-4 py-2">Период</th>
            <th class="px-4 py-2">Статус</th>
            <th class="px-4 py-2">Заказан</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="cursor-pointer border-t border-steel-200 hover:bg-steel-50 dark:border-steel-800 dark:hover:bg-steel-900"
            @click="open(item)"
          >
            <td class="px-4 py-2 font-medium">{{ item.number }}</td>
            <td class="px-4 py-2">{{ userLabel(item) }}</td>
            <td class="px-4 py-2">{{ DOCUMENT_TYPE_LABELS[item.type] ?? item.type }}</td>
            <td class="px-4 py-2 text-steel-500 dark:text-steel-400">
              <template v-if="item.periodFrom && item.periodTo">{{ formatDate(item.periodFrom) }} — {{ formatDate(item.periodTo) }}</template>
              <template v-else>—</template>
            </td>
            <td class="px-4 py-2">
              <UBadge :color="statusMeta(item.status).color" variant="subtle">{{ statusMeta(item.status).label }}</UBadge>
            </td>
            <td class="px-4 py-2 text-steel-500 dark:text-steel-400">{{ formatDate(item.createdAt) }}</td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-steel-400 dark:text-steel-500">Заказов нет</td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal
      v-model:open="isModalOpen"
      :title="selected ? `${DOCUMENT_TYPE_LABELS[selected.type] ?? selected.type} № ${selected.number}` : ''"
    >
      <template #body>
        <div v-if="selected" class="flex flex-col gap-4 text-sm">
          <dl class="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5">
            <dt class="text-steel-500">Клиент</dt>
            <dd>{{ userLabel(selected) }}</dd>
            <template v-if="selected.periodFrom && selected.periodTo">
              <dt class="text-steel-500">Период</dt>
              <dd>{{ formatDate(selected.periodFrom) }} — {{ formatDate(selected.periodTo) }}</dd>
            </template>
            <template v-if="selected.comment">
              <dt class="text-steel-500">Комментарий</dt>
              <dd class="whitespace-pre-line">{{ selected.comment }}</dd>
            </template>
            <template v-if="selected.fileName">
              <dt class="text-steel-500">Файл</dt>
              <dd>
                <a :href="fileUrl(selected)" target="_blank" class="text-brand-600 hover:underline">{{ selected.fileName }}</a>
              </dd>
            </template>
          </dl>

          <div class="rounded-lg border border-dashed border-steel-300 p-3 dark:border-steel-700">
            <p class="mb-2 font-medium">{{ selected.fileName ? 'Заменить файл' : 'Прикрепить готовый документ' }}</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" class="block w-full text-sm" @change="onFile" />
            <p class="mt-1 text-xs text-steel-500">PDF, JPG или PNG до 10 МБ. Клиент получит уведомление и сможет скачать файл.</p>
            <UButton class="mt-3" :loading="busy" :disabled="!file || Boolean(error)" icon="i-lucide-upload" @click="upload">
              Загрузить
            </UButton>
          </div>

          <div v-if="selected.status !== 'ready'" class="rounded-lg border border-steel-200 p-3 dark:border-steel-800">
            <p class="mb-2 font-medium">Не можем подготовить?</p>
            <UTextarea v-model="rejectComment" placeholder="Причина — клиент увидит её в кабинете" :rows="2" class="w-full" />
            <UButton class="mt-2" color="error" variant="soft" :loading="busy" @click="reject">Отклонить</UButton>
          </div>

          <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end">
          <UButton variant="ghost" color="neutral" @click="isModalOpen = false">Закрыть</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
