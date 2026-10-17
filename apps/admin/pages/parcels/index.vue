<script setup lang="ts">
import { useApiClient } from '~/shared/api/client';
import {
  type AppUser,
  PARCEL_STATUS_OPTIONS,
  type Parcel,
  ParcelStatus,
  type ParcelStatusHistoryItem,
} from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();
const items = ref<Parcel[]>([]);
const users = ref<AppUser[]>([]);
const loading = ref(false);

const isModalOpen = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
  userId: '',
  trackNumber: '',
  description: '',
  status: ParcelStatus.CREATED,
  weightKg: '',
  volumeM3: '',
  costSom: '',
  comment: '',
});
const history = ref<ParcelStatusHistoryItem[]>([]);

const userOptions = computed(() =>
  users.value.map((user: AppUser) => ({
    label: `${user.firstName ?? ''} ${userContact(user)}`.trim(),
    value: user.id,
  })),
);

// Пользователи сайта могут быть без Telegram — показываем e-mail.
function userContact(user: AppUser): string {
  return user.username ? `@${user.username}` : (user.email ?? user.telegramId ?? '');
}

function userLabel(userId: string): string {
  const user = users.value.find((item: AppUser) => item.id === userId);
  if (!user) return userId;
  return user.firstName
    ? `${user.firstName} ${userContact(user)}`.trim()
    : userContact(user) || userId;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: ParcelStatus): string {
  return PARCEL_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [parcels, allUsers] = await Promise.all([
      api.get<Parcel[]>('/parcels'),
      api.get<AppUser[]>('/users'),
    ]);
    items.value = parcels;
    users.value = allUsers;
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editingId.value = null;
  form.userId = users.value[0]?.id ?? '';
  form.trackNumber = '';
  form.description = '';
  form.status = ParcelStatus.CREATED;
  form.weightKg = '';
  form.volumeM3 = '';
  form.costSom = '';
  form.comment = '';
  history.value = [];
  isModalOpen.value = true;
}

async function openEdit(item: Parcel): Promise<void> {
  editingId.value = item.id;
  form.userId = item.userId;
  form.trackNumber = item.trackNumber;
  form.description = item.description ?? '';
  form.status = item.status;
  form.weightKg = item.weightKg ?? '';
  form.volumeM3 = item.volumeM3 ?? '';
  form.costSom = item.costSom ?? '';
  form.comment = item.comment ?? '';
  history.value = [];
  isModalOpen.value = true;
  // История статусов приходит только в карточке посылки.
  const full = await api.get<Parcel>(`/parcels/${item.id}`);
  history.value = full.history ?? [];
}

async function save(): Promise<void> {
  if (editingId.value) {
    await api.put(`/parcels/${editingId.value}`, {
      trackNumber: form.trackNumber,
      description: form.description || null,
      status: form.status,
      weightKg: form.weightKg || null,
      volumeM3: form.volumeM3 || null,
      costSom: form.costSom || null,
      comment: form.comment || null,
    });
  } else {
    await api.post('/parcels', {
      userId: form.userId,
      trackNumber: form.trackNumber,
      description: form.description || null,
      status: form.status,
      weightKg: form.weightKg || null,
      volumeM3: form.volumeM3 || null,
      costSom: form.costSom || null,
      comment: form.comment || null,
    });
  }

  isModalOpen.value = false;
  await load();
}

async function remove(item: Parcel): Promise<void> {
  if (!confirm(`Удалить посылку "${item.trackNumber}"?`)) return;
  await api.delete(`/parcels/${item.id}`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Посылки</h1>
      <UButton :disabled="users.length === 0" icon="i-lucide-plus" @click="openCreate">Добавить</UButton>
    </div>

    <div class="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-950">
      <table class="w-full text-left text-sm">
        <thead class="bg-steel-50 text-steel-600 dark:bg-steel-900 dark:text-steel-300">
          <tr>
            <th class="px-4 py-2">Трек-номер</th>
            <th class="px-4 py-2">Пользователь</th>
            <th class="px-4 py-2">Статус</th>
            <th class="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t border-steel-200 dark:border-steel-800">
            <td class="px-4 py-2">{{ item.trackNumber }}</td>
            <td class="px-4 py-2">{{ userLabel(item.userId) }}</td>
            <td class="px-4 py-2">{{ statusLabel(item.status) }}</td>
            <td class="px-4 py-2 text-right">
              <UButton size="xs" variant="ghost" @click="openEdit(item)">Изменить</UButton>
              <UButton size="xs" variant="ghost" color="error" @click="remove(item)">Удалить</UButton>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-steel-400 dark:text-steel-500">Посылок нет</td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="isModalOpen" :title="editingId ? 'Изменить посылку' : 'Новая посылка'">
      <template #body>
        <div class="flex flex-col gap-3">
          <UFormField label="Пользователь">
            <USelectMenu
              v-model="form.userId"
              :items="userOptions"
              value-key="value"
              :disabled="Boolean(editingId)"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Трек-номер">
            <UInput v-model="form.trackNumber" class="w-full" />
          </UFormField>
          <UFormField label="Описание">
            <UTextarea v-model="form.description" class="w-full" />
          </UFormField>
          <UFormField label="Статус">
            <USelectMenu v-model="form.status" :items="PARCEL_STATUS_OPTIONS" value-key="value" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-3 gap-3">
            <UFormField label="Вес, кг">
              <UInput v-model="form.weightKg" class="w-full" />
            </UFormField>
            <UFormField label="Объём, м³">
              <UInput v-model="form.volumeM3" class="w-full" />
            </UFormField>
            <UFormField label="Стоимость, сом">
              <UInput v-model="form.costSom" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Комментарий (видит клиент)">
            <UTextarea v-model="form.comment" class="w-full" />
          </UFormField>
          <div v-if="history.length" class="rounded-lg bg-steel-50 p-3 text-sm dark:bg-steel-900">
            <p class="mb-2 font-medium text-steel-600 dark:text-steel-300">История статусов</p>
            <ul class="space-y-1">
              <li v-for="h in history" :key="h.id" class="flex justify-between gap-3">
                <span>{{ statusLabel(h.status) }}</span>
                <span class="text-steel-400">{{ formatDateTime(h.createdAt) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="isModalOpen = false">Отмена</UButton>
          <UButton @click="save">Сохранить</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
