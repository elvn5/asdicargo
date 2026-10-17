<script setup lang="ts">
/**
 * Короткий тур по кабинету при первом входе. Флаг «уже показан» хранится в
 * localStorage — это удобство конкретного браузера, не данные аккаунта.
 */
const STORAGE_KEY = 'asdi-account-onboarding-v1';

const { t } = useI18n();
const open = ref(false);
const step = ref(0);

const slides = [
  { key: 's1', icon: 'i-lucide-package-search' },
  { key: 's2', icon: 'i-lucide-clipboard-list' },
  { key: 's3', icon: 'i-lucide-map-pin' },
  { key: 's4', icon: 'i-lucide-bell-ring' },
] as const;

const slide = computed(() => slides[step.value] ?? slides[0]);
const isLast = computed(() => step.value === slides.length - 1);

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) open.value = true;
  } catch {
    // Хранилище недоступно (приватный режим) — просто не показываем тур.
  }
});

function finish(): void {
  open.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // См. выше.
  }
}

function next(): void {
  if (isLast.value) finish();
  else step.value += 1;
}
</script>

<template>
  <UModal v-model:open="open" :dismissible="false" :ui="{ content: 'max-w-md' }">
    <template #content>
      <div class="p-6 sm:p-8">
        <!-- Прогресс -->
        <div class="mb-6 flex gap-1.5">
          <span
            v-for="(s, i) in slides"
            :key="s.key"
            class="h-1 flex-1 rounded-full transition-colors"
            :class="i <= step ? 'bg-brand-500' : 'bg-steel-200 dark:bg-steel-700'"
          />
        </div>

        <div class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-brand-gradient text-white shadow-lg shadow-brand-500/30">
          <UIcon :name="slide.icon" class="size-10" />
        </div>
        <h2 class="mt-6 text-center text-xl font-bold">{{ t(`account.onboarding.${slide.key}.title`) }}</h2>
        <p class="mt-2 text-center text-steel-600 dark:text-steel-300">{{ t(`account.onboarding.${slide.key}.text`) }}</p>

        <div class="mt-8 flex flex-col gap-2">
          <UButton block size="lg" @click="next">
            {{ isLast ? t('account.onboarding.done') : t('account.onboarding.next') }}
          </UButton>
          <UButton v-if="!isLast" block color="neutral" variant="ghost" @click="finish">
            {{ t('account.onboarding.skip') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
