<script setup lang="ts">
import { ApiError, useApiClient } from '~/shared/api/client';
import type { SitePage } from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const route = useRoute();
const api = useApiClient();
const slug = computed(() => String(route.params.slug));

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
  try {
    const page = await api.get<SitePage>(`/pages/admin/${slug.value}`);
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
    await api.put(`/pages/${slug.value}`, {
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

onMounted(load);
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Редактирование страницы</h1>
      <UButton variant="ghost" color="neutral" icon="i-lucide-arrow-left" to="/pages">К списку</UButton>
    </div>

    <UAlert v-if="error" color="error" variant="soft" :title="error" class="mb-4" />

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
