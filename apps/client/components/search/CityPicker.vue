<script setup lang="ts">
/**
 * Выбор города в модальном окне: поиск, «Популярные», затем города по странам.
 * Если города нет в справочнике — его можно выбрать как есть.
 */
const props = defineProps<{ title: string; exclude?: string }>();
const emit = defineEmits<{ select: [city: string] }>();
const open = defineModel<boolean>('open', { required: true });

const { t } = useI18n();
const query = ref('');
const input = ref<{ inputRef?: HTMLInputElement } | null>(null);

watch(open, async (value) => {
  if (!value) return;
  query.value = '';
  await nextTick();
  input.value?.inputRef?.focus();
});

const isExcluded = (city: string): boolean => Boolean(props.exclude) && city === props.exclude;

const groups = computed(() => {
  const q = query.value.trim();
  const result: Array<{ key: string; label: string; cities: string[] }> = [];
  if (!q) {
    result.push({
      key: 'popular',
      label: t('search.picker.popular'),
      cities: POPULAR_CITIES.filter((c) => !isExcluded(c)),
    });
  }
  result.push(
    {
      key: 'kg',
      label: t('search.picker.kg'),
      cities: searchCities(q, KG_CITIES).filter((c) => !isExcluded(c)),
    },
    {
      key: 'ru',
      label: t('search.picker.ru'),
      cities: searchCities(q, RU_CITIES).filter((c) => !isExcluded(c)),
    },
  );
  return result.filter((g) => g.cities.length > 0);
});

// Введённый вручную город, которого нет в справочнике.
const customCity = computed(() => {
  const q = query.value.trim();
  if (q.length < 2) return null;
  const known = [...KG_CITIES, ...RU_CITIES].some((c) => c.toLowerCase() === q.toLowerCase());
  return known ? null : q.charAt(0).toUpperCase() + q.slice(1);
});

function choose(city: string): void {
  emit('select', city);
  open.value = false;
}

function onEnter(): void {
  const first = groups.value.find((g) => g.key !== 'popular')?.cities[0];
  if (first) choose(first);
  else if (customCity.value) choose(customCity.value);
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :ui="{ body: 'p-0 sm:p-0' }">
    <template #body>
      <div class="border-b border-steel-100 p-4 dark:border-steel-800">
        <UInput
          ref="input"
          v-model="query"
          icon="i-lucide-search"
          :placeholder="t('search.picker.search')"
          size="lg"
          class="w-full"
          @keydown.enter.prevent="onEnter"
        />
      </div>
      <div class="max-h-[60vh] overflow-y-auto pb-2">
        <button
          v-if="customCity"
          type="button"
          class="flex w-full items-center gap-2 px-5 py-3 text-left text-sm font-medium text-brand-600 hover:bg-steel-50 dark:text-brand-400 dark:hover:bg-steel-800/50"
          @click="choose(customCity)"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          {{ t('search.picker.use', { city: customCity }) }}
        </button>
        <template v-for="group in groups" :key="group.key">
          <p class="bg-steel-50 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-steel-400 dark:bg-steel-800/60">
            {{ group.label }}
          </p>
          <button
            v-for="city in group.cities"
            :key="`${group.key}-${city}`"
            type="button"
            class="block w-full border-b border-steel-100 px-5 py-3 text-left text-sm last:border-b-0 hover:bg-steel-50 dark:border-steel-800 dark:hover:bg-steel-800/50"
            @click="choose(city)"
          >
            {{ city }}
          </button>
        </template>
        <p v-if="!groups.length && !customCity" class="px-5 py-6 text-center text-sm text-steel-500">
          {{ t('search.picker.notFound') }}
        </p>
      </div>
    </template>
  </UModal>
</template>
