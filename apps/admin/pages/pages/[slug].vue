<script setup lang="ts">
import { ApiError, useApiClient } from '~/shared/api/client';
import type { SitePage } from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const route = useRoute();
const api = useApiClient();
const slug = computed(() => String(route.params.slug));

// Язык редактируемого контента (страница хранится по строке на язык).
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

const form = reactive({
  title: '',
  published: true,
  content: '<p></p>',
});

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const page = await api.get<SitePage>(`/pages/admin/${slug.value}?language=${language.value}`);
    form.title = page.title;
    form.published = page.published;
    form.content = page.content || '<p></p>';
  } finally {
    loading.value = false;
  }
}

async function save(): Promise<void> {
  error.value = '';
  saved.value = false;
  saving.value = true;
  try {
    await api.put(`/pages/${slug.value}?language=${language.value}`, {
      title: form.title,
      published: form.published,
      content: form.content,
    });
    saved.value = true;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Не удалось сохранить';
  } finally {
    saving.value = false;
  }
}

// Переключение языка перезагружает контент выбранной локали.
async function switchLanguage(lang: Lang): Promise<void> {
  if (lang === language.value) return;
  language.value = lang;
  saved.value = false;
  await load();
}

onMounted(load);
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Редактирование страницы</h1>
      <UButton variant="ghost" color="neutral" icon="i-lucide-arrow-left" to="/pages">К списку</UButton>
    </div>

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

    <div class="flex flex-col gap-4">
      <UFormField label="Заголовок" required>
        <UInput v-model="form.title" class="w-full" placeholder="Название страницы" />
      </UFormField>

      <UFormField label="URL" help="Адрес страницы менять нельзя">
        <UInput :model-value="`/${slug}`" disabled class="w-full" />
      </UFormField>

      <UFormField>
        <USwitch v-model="form.published" label="Опубликована" />
      </UFormField>

      <UFormField label="Содержимое">
        <TiptapEditor v-model="form.content" />
      </UFormField>

      <div class="flex items-center justify-end gap-2">
        <span v-if="saved" class="text-sm text-primary-600 dark:text-primary-400">Сохранено</span>
        <UButton variant="ghost" color="neutral" to="/pages">Отмена</UButton>
        <UButton :loading="saving" icon="i-lucide-save" @click="save">Сохранить</UButton>
      </div>
    </div>
  </div>
</template>
