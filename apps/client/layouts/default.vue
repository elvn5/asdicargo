<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
const { t } = useI18n();
const localePath = useLocalePath();

// Каждый пункт ведёт на отдельную cargo-страницу.
const links = computed(() => [
  { label: t('nav.services'), to: localePath('/cargo-uslugi') },
  { label: t('nav.contacts'), to: localePath('/cargo-kontakty') },
  { label: t('nav.blog'), to: localePath('/cargo-blog') },
  { label: t('nav.directions'), to: localePath('/cargo-napravleniya') },
  { label: t('nav.documents'), to: localePath('/cargo-dokumenti') },
  { label: t('nav.calculator'), to: localePath('/cargo-kalkulyator') },
  { label: t('nav.faq'), to: localePath('/cargo-faq') },
]);

const config = useRuntimeConfig();

// Версия задеплоенного образа (пусто в локальной разработке — тогда не показываем).
const version = String(config.public.appVersion ?? '');
const versionLabel = /^\d/.test(version) ? `v${version}` : version;

// Мобильное меню
const mobileOpen = ref(false);
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);

// Сессия сайта: инициализируется клиентским плагином plugins/auth.client.ts.
const auth = useAuthStore();
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-steel-900 dark:bg-steel-950 dark:text-steel-100">
    <header
      class="sticky top-0 z-40 border-b border-steel-200/70 bg-white/80 backdrop-blur dark:border-steel-800/70 dark:bg-steel-950/80"
    >
      <div class="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        <!-- Логотип: левая колонка -->
        <div class="flex items-center">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-lg font-semibold">
            <span class="inline-block h-6 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            <span>As<span class="text-brand-600 dark:text-brand-400">Di</span> Cargo</span>
          </NuxtLink>
        </div>

        <!-- Навигация: центральная колонка, строго по центру -->
        <nav class="hidden items-center gap-1 lg:flex">
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

        <!-- Действия: правая колонка -->
        <div class="flex items-center justify-end gap-1.5">
          <LangSwitcher />
          <ThemeToggle />
          <ClientOnly>
            <NuxtLink
              v-if="auth.isAuthenticated"
              :to="localePath('/account')"
              class="hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-steel-600 transition hover:text-brand-500 sm:flex dark:text-steel-300 dark:hover:text-brand-400"
            >
              <UAvatar :src="auth.user?.avatarUrl ?? undefined" :alt="auth.displayName" size="2xs" icon="i-lucide-user" />
              <span class="max-w-[8rem] truncate">{{ auth.displayName }}</span>
            </NuxtLink>
            <UButton
              v-else
              :to="localePath('/login')"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-lucide-log-in"
              class="hidden sm:inline-flex"
            >
              {{ t('auth.loginButton') }}
            </UButton>
            <template #fallback>
              <UButton
                :to="localePath('/login')"
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-log-in"
                class="hidden sm:inline-flex"
              >
                {{ t('auth.loginButton') }}
              </UButton>
            </template>
          </ClientOnly>
          <UButton
            class="lg:hidden"
            color="neutral"
            variant="ghost"
            :icon="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            :aria-label="t('header.menu')"
            :aria-expanded="mobileOpen"
            @click="mobileOpen = !mobileOpen"
          />
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <nav
          v-if="mobileOpen"
          class="border-t border-steel-200/70 bg-white/95 backdrop-blur dark:border-steel-800/70 dark:bg-steel-950/95 lg:hidden"
        >
          <div class="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            <UButton
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              color="neutral"
              variant="ghost"
              size="lg"
              block
              @click="mobileOpen = false"
            >
              {{ link.label }}
            </UButton>
            <ClientOnly>
              <UButton
                v-if="auth.isAuthenticated"
                :to="localePath('/account')"
                color="neutral"
                variant="soft"
                size="lg"
                icon="i-lucide-user"
                block
                @click="mobileOpen = false"
              >
                {{ auth.displayName }}
              </UButton>
              <UButton
                v-else
                :to="localePath('/login')"
                color="primary"
                variant="soft"
                size="lg"
                icon="i-lucide-log-in"
                block
                @click="mobileOpen = false"
              >
                {{ t('auth.loginButton') }}
              </UButton>
              <template #fallback>
                <UButton
                  :to="localePath('/login')"
                  color="primary"
                  variant="soft"
                  size="lg"
                  icon="i-lucide-log-in"
                  block
                  @click="mobileOpen = false"
                >
                  {{ t('auth.loginButton') }}
                </UButton>
              </template>
            </ClientOnly>
          </div>
        </nav>
      </Transition>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-steel-200 bg-steel-50 dark:border-steel-800 dark:bg-steel-900/60">
      <!-- Main footer grid -->
      <div class="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div>
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-lg font-semibold">
            <span class="inline-block h-6 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            <span>As<span class="text-brand-600 dark:text-brand-400">Di</span> Cargo</span>
          </NuxtLink>
          <p class="mt-3 text-sm leading-relaxed text-steel-500 dark:text-steel-400">
            {{ t('footer.description') }}
          </p>
        </div>

        <!-- Services -->
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-steel-900 dark:text-steel-100">
            {{ t('footer.servicesTitle') }}
          </h4>
          <ul class="space-y-2.5 text-sm text-steel-500 dark:text-steel-400">
            <li>{{ t('footer.s1') }}</li>
            <li>{{ t('footer.s2') }}</li>
            <li>{{ t('footer.s3') }}</li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-steel-900 dark:text-steel-100">
            {{ t('footer.companyTitle') }}
          </h4>
          <ul class="space-y-2.5 text-sm">
            <li><NuxtLink :to="localePath('/cargo-uslugi')" class="text-steel-500 transition hover:text-brand-500 dark:text-steel-400 dark:hover:text-brand-400">{{ t('footer.about') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-kontakty')" class="text-steel-500 transition hover:text-brand-500 dark:text-steel-400 dark:hover:text-brand-400">{{ t('footer.reviews') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-faq')" class="text-steel-500 transition hover:text-brand-500 dark:text-steel-400 dark:hover:text-brand-400">{{ t('footer.faq') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-dokumenti')" class="text-steel-500 transition hover:text-brand-500 dark:text-steel-400 dark:hover:text-brand-400">{{ t('footer.documents') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-blog')" class="text-steel-500 transition hover:text-brand-500 dark:text-steel-400 dark:hover:text-brand-400">{{ t('footer.blog') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-kontakty')" class="text-steel-500 transition hover:text-brand-500 dark:text-steel-400 dark:hover:text-brand-400">{{ t('footer.contacts') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Contacts -->
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-steel-900 dark:text-steel-100">
            {{ t('footer.contactsTitle') }}
          </h4>
          <ul class="space-y-3 text-sm text-steel-500 dark:text-steel-400">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-brand-500" />
              <span>{{ t('footer.address') }}</span>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-phone" class="size-4 shrink-0 text-brand-500" />
              <a href="tel:+996552165165" class="transition hover:text-brand-500 dark:hover:text-brand-400">+996 552 165 165</a>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-mail" class="size-4 shrink-0 text-brand-500" />
              <a href="mailto:lidiya22_92@mail.ru" class="transition hover:text-brand-500 dark:hover:text-brand-400">lidiya22_92@mail.ru</a>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="size-4 shrink-0 text-brand-500" />
              <span>09:00–19:00 (+6 GMT)</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-steel-200 dark:border-steel-800">
        <div
          class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-steel-400 dark:text-steel-500 sm:flex-row"
        >
          <span>{{ t('footer.copyright') }}</span>
          <span
            v-if="versionLabel"
            class="select-none text-transparent transition-colors duration-300 hover:text-steel-400 dark:hover:text-steel-500"
          >
            {{ versionLabel }}
          </span>
        </div>
      </div>
    </footer>

    <CookieBanner />
  </div>
</template>
