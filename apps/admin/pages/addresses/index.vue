<script setup lang="ts">
import { useApiClient } from '~/shared/api/client';
import { ADDRESS_KIND_OPTIONS, type Address, type AddressKind } from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();
const items = ref<Address[]>([]);
const loading = ref(false);

const isModalOpen = ref(false);
const editingId = ref<string | null>(null);
const saveError = ref<string | null>(null);

function emptyForm() {
  return {
    title: '',
    kind: 'pickup' as AddressKind,
    city: '',
    fullAddress: '',
    phone: '',
    workingHours: '',
    // Координаты одной строкой «широта, долгота» — так их удобно копировать с карт.
    coords: '',
    comment: '',
    isActive: true,
    sortOrder: 0,
  };
}

const form = reactive(emptyForm());

function kindLabel(kind: AddressKind): string {
  return ADDRESS_KIND_OPTIONS.find((o) => o.value === kind)?.label ?? kind;
}

function parseCoords(raw: string): { latitude: number | null; longitude: number | null } | null {
  const trimmed = raw.trim();
  if (!trimmed) return { latitude: null, longitude: null };
  const parts = trimmed.split(/[,\s]+/).map(Number);
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const [latitude, longitude] = parts as [number, number];
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    items.value = await api.get<Address[]>('/addresses');
  } finally {
    loading.value = false;
  }
}

function openCreate(): void {
  editingId.value = null;
  saveError.value = null;
  Object.assign(form, emptyForm());
  isModalOpen.value = true;
}

function openEdit(item: Address): void {
  editingId.value = item.id;
  saveError.value = null;
  Object.assign(form, {
    title: item.title,
    kind: item.kind,
    city: item.city ?? '',
    fullAddress: item.fullAddress,
    phone: item.phone ?? '',
    workingHours: item.workingHours ?? '',
    coords:
      item.latitude !== null && item.longitude !== null
        ? `${item.latitude}, ${item.longitude}`
        : '',
    comment: item.comment ?? '',
    isActive: item.isActive,
    sortOrder: item.sortOrder,
  });
  isModalOpen.value = true;
}

async function save(): Promise<void> {
  const coords = parseCoords(form.coords);
  if (!coords) {
    saveError.value = 'Координаты в формате «42.8746, 74.5698»';
    return;
  }
  const payload = {
    title: form.title,
    kind: form.kind,
    city: form.city || null,
    fullAddress: form.fullAddress,
    phone: form.phone || null,
    workingHours: form.workingHours || null,
    ...coords,
    comment: form.comment || null,
    isActive: form.isActive,
    sortOrder: form.sortOrder,
  };

  if (editingId.value) {
    await api.put(`/addresses/${editingId.value}`, payload);
  } else {
    await api.post('/addresses', payload);
  }

  isModalOpen.value = false;
  await load();
}

async function remove(item: Address): Promise<void> {
  if (!confirm(`Удалить "${item.title}"?`)) return;
  await api.delete(`/addresses/${item.id}`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Адреса и пункты выдачи</h1>
        <p class="text-sm text-steel-500 dark:text-steel-400">Активные адреса видны клиентам в кабинете — списком и на карте.</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreate">Добавить</UButton>
    </div>

    <div class="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-950">
      <table class="w-full text-left text-sm">
        <thead class="bg-steel-50 text-steel-600 dark:bg-steel-900 dark:text-steel-300">
          <tr>
            <th class="px-4 py-2">Название</th>
            <th class="px-4 py-2">Тип</th>
            <th class="px-4 py-2">Адрес</th>
            <th class="px-4 py-2">Карта</th>
            <th class="px-4 py-2">Активен</th>
            <th class="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t border-steel-200 dark:border-steel-800">
            <td class="px-4 py-2">{{ item.title }}</td>
            <td class="px-4 py-2">{{ kindLabel(item.kind) }}</td>
            <td class="px-4 py-2 text-steel-500 dark:text-steel-400">
              <template v-if="item.city">{{ item.city }}, </template>{{ item.fullAddress }}
            </td>
            <td class="px-4 py-2">
              <UIcon
                :name="item.latitude !== null ? 'i-lucide-map-pin-check' : 'i-lucide-map-pin-off'"
                :class="item.latitude !== null ? 'text-emerald-600' : 'text-steel-400'"
                class="size-4"
              />
            </td>
            <td class="px-4 py-2">{{ item.isActive ? 'Да' : 'Нет' }}</td>
            <td class="px-4 py-2 text-right">
              <UButton size="xs" variant="ghost" @click="openEdit(item)">Изменить</UButton>
              <UButton size="xs" variant="ghost" color="error" @click="remove(item)">Удалить</UButton>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-steel-400 dark:text-steel-500">Список пуст</td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="isModalOpen" :title="editingId ? 'Изменить адрес' : 'Новый адрес'">
      <template #body>
        <div class="flex flex-col gap-3">
          <UFormField label="Название">
            <UInput v-model="form.title" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Тип">
              <USelectMenu v-model="form.kind" :items="ADDRESS_KIND_OPTIONS" value-key="value" :search-input="false" class="w-full" />
            </UFormField>
            <UFormField label="Город">
              <UInput v-model="form.city" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Адрес">
            <UTextarea v-model="form.fullAddress" :rows="2" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Телефон">
              <UInput v-model="form.phone" class="w-full" />
            </UFormField>
            <UFormField label="Часы работы">
              <UInput v-model="form.workingHours" placeholder="Пн–Пт 9:00–18:00" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="Координаты" help="Широта, долгота — скопируйте из Яндекс/Google Карт. Без координат точка не появится на карте.">
            <UInput v-model="form.coords" placeholder="42.8746, 74.5698" class="w-full" />
          </UFormField>
          <UFormField label="Комментарий (виден клиентам)">
            <UTextarea v-model="form.comment" :rows="2" class="w-full" />
          </UFormField>
          <UFormField label="Порядок сортировки">
            <UInput v-model.number="form.sortOrder" type="number" class="w-full" />
          </UFormField>
          <UCheckbox v-model="form.isActive" label="Активен (виден клиентам)" />
          <p v-if="saveError" class="text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>
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
