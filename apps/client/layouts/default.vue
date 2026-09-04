<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

// Якорные пункты ведут на главную с якорем, чтобы работать и со страниц блога.
const links = computed(() => [
  { label: t('nav.services'), to: `${localePath('/')}#services` },
  { label: t('nav.how'), to: `${localePath('/')}#how` },
  { label: t('nav.contacts'), to: `${localePath('/')}#contacts` },
  { label: t('nav.blog'), to: localePath('/blog') },
]);

const config = useRuntimeConfig();
const botUrl = config.public.botUrl as string;
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-steel-900 dark:bg-steel-950 dark:text-steel-100">
    <header
      class="sticky top-0 z-40 border-b border-steel-200/70 bg-white/80 backdrop-blur dark:border-steel-800/70 dark:bg-steel-950/80"
    >
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-lg font-semibold">
          <span class="inline-block h-6 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          <span>As<span class="text-brand-600 dark:text-brand-400">Di</span> Cargo</span>
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex">
          <UButton
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            {{ link.label }}
          </UButton>
        </nav>

        <div class="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <UButton :to="botUrl" target="_blank" icon="i-lucide-send" color="primary">
            <span class="hidden sm:inline">{{ t('header.openBot') }}</span>
          </UButton>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-steel-200 dark:border-steel-800">
      <div
        class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-steel-500 dark:text-steel-400 sm:flex-row"
      >
        <span>© {{ new Date().getFullYear() }} AsDi Cargo</span>
        <span>{{ t('footer.tagline') }}</span>
      </div>
    </footer>
  </div>
</template>
