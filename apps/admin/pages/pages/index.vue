<script setup lang="ts">
import { useApiClient } from '~/shared/api/client';
import type { SitePage } from '~/shared/api/types';

definePageMeta({ layout: 'default' });

const api = useApiClient();
const pages = ref<SitePage[]>([]);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    pages.value = await api.get<SitePage[]>('/pages/admin');
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Страницы</h1>
    </div>

    <div class="overflow-hidden rounded-lg border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-950">
      <table class="w-full text-left text-sm">
        <thead class="bg-steel-50 text-steel-600 dark:bg-steel-900 dark:text-steel-300">
          <tr>
            <th class="px-4 py-2">Название</th>
            <th class="px-4 py-2">URL</th>
            <th class="px-4 py-2">Статус</th>
            <th class="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="page in pages" :key="page.id" class="border-t border-steel-200 dark:border-steel-800">
            <td class="px-4 py-2 font-medium">{{ page.title }}</td>
            <td class="px-4 py-2 text-xs text-steel-400">/{{ page.slug }}</td>
            <td class="px-4 py-2">
              <UBadge :color="page.published ? 'primary' : 'neutral'" variant="subtle">
                {{ page.published ? 'Опубликована' : 'Скрыта' }}
              </UBadge>
            </td>
            <td class="px-4 py-2 text-right whitespace-nowrap">
              <UButton size="xs" variant="ghost" :to="`/pages/${page.slug}`">Изменить</UButton>
            </td>
          </tr>
          <tr v-if="!loading && pages.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-steel-400 dark:text-steel-500">Страниц пока нет</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
