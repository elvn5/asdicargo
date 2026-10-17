<script setup lang="ts">
import { useApiClient } from '~/shared/api/client';
import {
  APPEAL_CATEGORY_LABELS,
  APPEAL_STATUS_OPTIONS,
  type Appeal,
  type AppealStatus,
} from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();
const items = ref<Appeal[]>([]);
const loading = ref(false);
const statusFilter = ref<AppealStatus | 'all'>('open');

const FILTERS = [{ value: 'all' as const, label: 'Все' }, ...APPEAL_STATUS_OPTIONS];

const selected = ref<Appeal | null>(null);
const isModalOpen = ref(false);
const reply = ref('');
const busy = ref(false);
const error = ref<string | null>(null);

function statusMeta(status: AppealStatus) {
  return (
    APPEAL_STATUS_OPTIONS.find((o) => o.value === status) ?? {
      value: status,
      label: status,
      color: 'neutral' as const,
    }
  );
}

function userLabel(item: Appeal): string {
  const u = item.user;
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return (
    [name, u.email ?? (u.username ? `@${u.username}` : '')].filter(Boolean).join(' · ') || u.id
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const query = statusFilter.value === 'all' ? '' : `?status=${statusFilter.value}`;
    items.value = await api.get<Appeal[]>(`/appeals${query}`);
  } finally {
    loading.value = false;
  }
}

watch(statusFilter, load);

async function open(item: Appeal): Promise<void> {
  reply.value = '';
  error.value = null;
  selected.value = await api.get<Appeal>(`/appeals/${item.id}`);
  isModalOpen.value = true;
}

async function sendReply(): Promise<void> {
  if (!selected.value || !reply.value.trim()) return;
  busy.value = true;
  error.value = null;
  try {
    selected.value = await api.post<Appeal>(`/appeals/${selected.value.id}/messages`, {
      body: reply.value.trim(),
    });
    reply.value = '';
    await load();
  } catch {
    error.value = 'Не удалось отправить ответ';
  } finally {
    busy.value = false;
  }
}

async function setStatus(status: AppealStatus): Promise<void> {
  if (!selected.value) return;
  busy.value = true;
  try {
    selected.value = await api.put<Appeal>(`/appeals/${selected.value.id}`, { status });
    await load();
  } finally {
    busy.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Обращения клиентов</h1>
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
            <th class="px-4 py-2">Тема</th>
            <th class="px-4 py-2">Посылка</th>
            <th class="px-4 py-2">Статус</th>
            <th class="px-4 py-2">Последнее сообщение</th>
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
            <td class="max-w-64 px-4 py-2">
              <p class="truncate">{{ item.subject }}</p>
              <p class="text-xs text-steel-500">{{ APPEAL_CATEGORY_LABELS[item.category] ?? item.category }}</p>
            </td>
            <td class="px-4 py-2">{{ item.parcel?.trackNumber ?? '—' }}</td>
            <td class="px-4 py-2">
              <UBadge :color="statusMeta(item.status).color" variant="subtle">{{ statusMeta(item.status).label }}</UBadge>
            </td>
            <td class="px-4 py-2 text-steel-500 dark:text-steel-400">{{ formatDate(item.lastMessageAt) }}</td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-steel-400 dark:text-steel-500">Обращений нет</td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="isModalOpen" :title="selected ? `Обращение № ${selected.number}: ${selected.subject}` : ''">
      <template #body>
        <div v-if="selected" class="flex flex-col gap-4 text-sm">
          <p class="text-steel-500">
            {{ userLabel(selected) }} · {{ APPEAL_CATEGORY_LABELS[selected.category] ?? selected.category }}
            <template v-if="selected.parcel"> · посылка {{ selected.parcel.trackNumber }}</template>
          </p>

          <div class="max-h-80 space-y-3 overflow-y-auto rounded-lg bg-steel-50 p-3 dark:bg-steel-900">
            <div
              v-for="m in selected.messages ?? []"
              :key="m.id"
              class="flex"
              :class="m.author === 'manager' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[85%] rounded-xl px-3 py-2"
                :class="m.author === 'manager' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-steel-800'"
              >
                <p class="mb-0.5 text-xs opacity-70">{{ m.author === 'manager' ? 'Менеджер' : 'Клиент' }} · {{ formatDate(m.createdAt) }}</p>
                <p class="whitespace-pre-line break-words">{{ m.body }}</p>
              </div>
            </div>
          </div>

          <template v-if="selected.status !== 'closed'">
            <UTextarea v-model="reply" placeholder="Ответ клиенту — он увидит его в кабинете и получит уведомление" :rows="3" class="w-full" />
            <div class="flex justify-end">
              <UButton :loading="busy" :disabled="!reply.trim()" icon="i-lucide-send" @click="sendReply">Ответить</UButton>
            </div>
          </template>
          <p v-else class="text-steel-500">Обращение закрыто.</p>
          <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <UButton
            v-if="selected && selected.status !== 'closed'"
            variant="soft"
            color="neutral"
            icon="i-lucide-circle-check"
            :loading="busy"
            @click="setStatus('closed')"
          >
            Закрыть обращение
          </UButton>
          <UButton
            v-else-if="selected"
            variant="soft"
            color="neutral"
            icon="i-lucide-rotate-ccw"
            :loading="busy"
            @click="setStatus('open')"
          >
            Открыть снова
          </UButton>
          <UButton variant="ghost" color="neutral" @click="isModalOpen = false">Закрыть окно</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
