<script setup lang="ts">
/**
 * Предложение установить кабинет как PWA. На Android/Chrome — системный диалог
 * через beforeinstallprompt, на iOS (где его нет) — подсказка про «Поделиться».
 * Ничего не показываем, если уже запущено как приложение.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const { t } = useI18n();
const deferred = ref<BeforeInstallPromptEvent | null>(null);
const isIos = ref(false);
const installed = ref(true);

function onPrompt(event: Event): void {
  event.preventDefault();
  deferred.value = event as BeforeInstallPromptEvent;
}

onMounted(() => {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  installed.value = standalone;
  isIos.value = /iphone|ipad|ipod/i.test(navigator.userAgent);
  window.addEventListener('beforeinstallprompt', onPrompt);
  window.addEventListener('appinstalled', () => {
    installed.value = true;
    deferred.value = null;
  });
});

onBeforeUnmount(() => window.removeEventListener('beforeinstallprompt', onPrompt));

async function install(): Promise<void> {
  if (!deferred.value) return;
  await deferred.value.prompt();
  await deferred.value.userChoice;
  deferred.value = null;
}

const visible = computed(() => !installed.value && (deferred.value !== null || isIos.value));
</script>

<template>
  <div
    v-if="visible"
    class="flex items-center gap-4 rounded-brand-lg border border-steel-200 bg-white p-4 dark:border-steel-800 dark:bg-steel-900/50"
  >
    <img src="/icons/icon-192.png" alt="" class="size-12 shrink-0 rounded-xl" />
    <div class="min-w-0 flex-1">
      <p class="font-semibold">{{ t('account.install.title') }}</p>
      <p class="text-sm text-steel-500 dark:text-steel-400">
        {{ deferred ? t('account.install.text') : t('account.install.iosHint') }}
      </p>
    </div>
    <UButton v-if="deferred" size="sm" icon="i-lucide-download" @click="install">
      {{ t('account.install.button') }}
    </UButton>
  </div>
</template>
