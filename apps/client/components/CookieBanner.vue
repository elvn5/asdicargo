<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const accepted = ref(true); // start hidden to avoid flash

onMounted(() => {
  accepted.value = localStorage.getItem('cookie-consent') === 'true';
});

function accept() {
  localStorage.setItem('cookie-consent', 'true');
  accepted.value = true;
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="!accepted"
      class="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div
        class="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 rounded-xl border border-steel-200 bg-white px-6 py-4 shadow-lg dark:border-steel-700 dark:bg-steel-900 sm:flex-row sm:gap-6"
      >
        <p class="text-sm text-steel-600 dark:text-steel-300">
          {{ t('cookie.text') }}
          <NuxtLink :to="localePath('/politika-konfidentsialnosti')" class="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            {{ t('site.privacy.cookieMore') }}
          </NuxtLink>
        </p>
        <UButton
          color="primary"
          size="sm"
          class="shrink-0"
          @click="accept"
        >
          {{ t('cookie.accept') }}
        </UButton>
      </div>
    </div>
  </Transition>
</template>
