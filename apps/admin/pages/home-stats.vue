<script setup lang="ts">
import { ApiError, useApiClient } from '~/shared/api/client';
import type { HomeStat } from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();

// Показатели хранятся по строке на язык — как страницы сайта.
type Lang = 'ru' | 'ky' | 'en';
const languages: Array<{ value: Lang; label: string }> = [
  { value: 'ru', label: 'Русский' },
  { value: 'ky', label: 'Кыргызча' },
  { value: 'en', label: 'English' },
];
const language = ref<Lang>('ru');

const loading = ref(false);
const saving = ref(false);
const saved = ref(false);
const error = ref('');

const items = reactive<Array<{ position: number; value: string; label: string }>>([
  { position: 1, value: '', label: '' },
  { position: 2, value: '', label: '' },
  { position: 3, value: '', label: '' },
  { position: 4, value: '', label: '' },
]);

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const rows = await api.get<HomeStat[]>(`/home-stats/admin?language=${language.value}`);
    for (const row of rows) {
      const item = items.find((i) => i.position === row.position);
      if (item) {
        item.value = row.value;
        item.label = row.label;
      }
    }
  } finally {
    loading.value = false;
  }
}

async function save(): Promise<void> {
  error.value = '';
  saved.value = false;
  saving.value = true;
  try {
    await api.put(`/home-stats?language=${language.value}`, {
      items: items.map((i) => ({ ...i })),
    });
    saved.value = true;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось сохранить';
  } finally {
    saving.value = false;
  }
}

async function switchLanguage(lang: Lang): Promise<void> {
  if (lang === language.value) return;
  language.value = lang;
  saved.value = false;
  await load();
}

onMounted(load);
</script>

<template>
  <div class="max-w-xl">
    <h1 class="mb-4 text-xl font-semibold">AsDi Cargo в цифрах</h1>

    <UAlert v-if="error" color="error" variant="soft" :title="error" class="mb-4" />

    <!-- Переключатель языка -->
    <div class="mb-4 inline-flex rounded-lg border border-steel-200 bg-steel-50 p-1 dark:border-steel-800 dark:bg-steel-900">
      <button
        v-for="l in languages"
        :key="l.value"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="
          language === l.value
            ? 'bg-white text-steel-900 shadow-sm dark:bg-steel-950 dark:text-steel-100'
            : 'text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-steel-200'
        "
        @click="switchLanguage(l.value)"
      >
        {{ l.label }}
      </button>
    </div>

    <div class="flex flex-col gap-3 rounded-lg border border-steel-200 bg-white p-4 dark:border-steel-800 dark:bg-steel-950">
      <div v-for="item in items" :key="item.position" class="grid grid-cols-2 gap-3">
        <UFormField :label="`Значение #${item.position}`" help="Напр. 2020, 10 000+, 99%">
          <UInput v-model="item.value" class="w-full" />
        </UFormField>
        <UFormField :label="`Подпись #${item.position}`">
          <UInput v-model="item.label" class="w-full" />
        </UFormField>
      </div>

      <div class="mt-2 flex items-center gap-2">
        <UButton :loading="saving" @click="save">Сохранить</UButton>
        <span v-if="saved" class="text-sm text-primary-600 dark:text-primary-400">Сохранено</span>
      </div>
    </div>
  </div>
</template>
