<script setup lang="ts">
import { useApiClient } from '~/shared/api/client';
import {
  REQUEST_STATUS_OPTIONS,
  SHIPMENT_DIRECTION_LABELS,
  type ShipmentRequest,
  type ShipmentRequestStatus,
} from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();
const items = ref<ShipmentRequest[]>([]);
const loading = ref(false);
const statusFilter = ref<ShipmentRequestStatus | 'all'>('new');

const FILTERS: { value: ShipmentRequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  ...REQUEST_STATUS_OPTIONS.map(({ value, label }) => ({ value, label })),
];

// Менеджер может выставить любой статус, кроме «отменена клиентом».
const EDITABLE_STATUSES = REQUEST_STATUS_OPTIONS.filter((o) => o.value !== 'cancelled');

const selected = ref<ShipmentRequest | null>(null);
const isModalOpen = ref(false);
const form = reactive({
  status: 'new' as ShipmentRequestStatus,
  managerComment: '',
  trackNumber: '',
});
const saving = ref(false);
const error = ref<string | null>(null);

function statusMeta(status: ShipmentRequestStatus) {
  return (
    REQUEST_STATUS_OPTIONS.find((o) => o.value === status) ?? {
      value: status,
      label: status,
      color: 'neutral' as const,
    }
  );
}

function userLabel(item: ShipmentRequest): string {
  const u = item.user;
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  const contact = u.email ?? (u.username ? `@${u.username}` : (u.phone ?? ''));
  return [name, contact].filter(Boolean).join(' · ') || u.id;
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
    items.value = await api.get<ShipmentRequest[]>(`/shipment-requests${query}`);
  } finally {
    loading.value = false;
  }
}

watch(statusFilter, load);

function open(item: ShipmentRequest): void {
  selected.value = item;
  form.status = item.status;
  form.managerComment = item.managerComment ?? '';
  form.trackNumber = '';
  error.value = null;
  isModalOpen.value = true;
}

async function save(): Promise<void> {
  if (!selected.value) return;
  saving.value = true;
  error.value = null;
  try {
    await api.put(`/shipment-requests/${selected.value.id}`, {
      // Статус «отменена клиентом» менеджер не меняет — отправляем только комментарий.
      ...(selected.value.status === 'cancelled' ? {} : { status: form.status }),
      managerComment: form.managerComment,
    });
    isModalOpen.value = false;
    await load();
  } catch {
    error.value = 'Не удалось сохранить';
  } finally {
    saving.value = false;
  }
}

async function convert(): Promise<void> {
  if (!selected.value || !form.trackNumber.trim()) {
    error.value = 'Укажите трек-номер посылки';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    if (form.managerComment !== (selected.value.managerComment ?? '')) {
      await api.put(`/shipment-requests/${selected.value.id}`, {
        managerComment: form.managerComment,
      });
    }
    await api.post(`/shipment-requests/${selected.value.id}/convert`, {
      trackNumber: form.trackNumber.trim(),
    });
    isModalOpen.value = false;
    await load();
  } catch {
    error.value = 'Не удалось создать посылку';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Заявки на перевозку</h1>
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
            <th class="px-4 py-2">Маршрут</th>
            <th class="px-4 py-2">Груз</th>
            <th class="px-4 py-2">≈ Стоимость</th>
            <th class="px-4 py-2">Статус</th>
            <th class="px-4 py-2">Создана</th>
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
            <td class="px-4 py-2">{{ item.fromCity }} → {{ item.toCity }}</td>
            <td class="max-w-56 truncate px-4 py-2 text-steel-500 dark:text-steel-400">
              {{ Number(item.weightKg) }} кг · {{ item.cargoDescription }}
            </td>
            <td class="px-4 py-2">{{ item.estimatedCostSom.toLocaleString('ru-RU') }} сом</td>
            <td class="px-4 py-2">
              <UBadge :color="statusMeta(item.status).color" variant="subtle">{{ statusMeta(item.status).label }}</UBadge>
            </td>
            <td class="px-4 py-2 text-steel-500 dark:text-steel-400">{{ formatDate(item.createdAt) }}</td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="7" class="px-4 py-6 text-center text-steel-400 dark:text-steel-500">Заявок нет</td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="isModalOpen" :title="selected ? `Заявка № ${selected.number}` : ''">
      <template #body>
        <div v-if="selected" class="flex flex-col gap-4 text-sm">
          <dl class="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1.5">
            <dt class="text-steel-500">Клиент</dt>
            <dd>{{ userLabel(selected) }}</dd>
            <dt class="text-steel-500">Направление</dt>
            <dd>{{ SHIPMENT_DIRECTION_LABELS[selected.direction] }}: {{ selected.fromCity }} → {{ selected.toCity }}</dd>
            <dt class="text-steel-500">Груз</dt>
            <dd>{{ selected.cargoDescription }}</dd>
            <dt class="text-steel-500">Вес / объём</dt>
            <dd>
              {{ Number(selected.weightKg) }} кг<template v-if="selected.volumeM3"> / {{ Number(selected.volumeM3) }} м³</template>
            </dd>
            <dt class="text-steel-500">≈ Стоимость</dt>
            <dd>{{ selected.estimatedCostSom.toLocaleString('ru-RU') }} сом</dd>
            <dt class="text-steel-500">Забор груза</dt>
            <dd>{{ selected.pickupRequired ? selected.pickupAddress : 'Нет — привезёт сам' }}</dd>
            <dt class="text-steel-500">Получатель</dt>
            <dd>{{ selected.recipientName }}, {{ selected.recipientPhone }}<br />{{ selected.recipientAddress }}</dd>
            <template v-if="selected.comment">
              <dt class="text-steel-500">Комментарий</dt>
              <dd class="whitespace-pre-line">{{ selected.comment }}</dd>
            </template>
          </dl>

          <UFormField v-if="selected.status !== 'cancelled'" label="Статус">
            <USelectMenu v-model="form.status" :items="EDITABLE_STATUSES" value-key="value" :search-input="false" class="w-full" />
          </UFormField>
          <UFormField label="Ответ клиенту (виден в кабинете)">
            <UTextarea v-model="form.managerComment" :rows="3" class="w-full" />
          </UFormField>

          <div
            v-if="!selected.parcelId && !['cancelled', 'rejected'].includes(selected.status)"
            class="rounded-lg border border-dashed border-steel-300 p-3 dark:border-steel-700"
          >
            <p class="mb-2 font-medium">Груз принят? Создайте посылку</p>
            <div class="flex gap-2">
              <UInput v-model="form.trackNumber" placeholder="Трек-номер" class="flex-1" />
              <UButton :loading="saving" icon="i-lucide-package-plus" @click="convert">Создать посылку</UButton>
            </div>
            <p class="mt-1 text-xs text-steel-500">Посылка появится у клиента, заявка станет «Выполнена».</p>
          </div>
          <p v-else-if="selected.parcelId" class="text-emerald-600">✓ Посылка по заявке создана</p>

          <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="isModalOpen = false">Закрыть</UButton>
          <UButton :loading="saving" @click="save">Сохранить</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
