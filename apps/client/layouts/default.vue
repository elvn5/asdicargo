<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
const { t } = useI18n();
const localePath = useLocalePath();

// Каждый пункт ведёт на отдельную cargo-страницу.
// shortLabel — компактная подпись для пилюльной навигации (длинные названия).
const links = computed((): Array<{ label: string; fullLabel?: string; to: string }> => [
  { label: t('nav.services'), to: localePath('/cargo-uslugi') },
  { label: t('nav.directions'), to: localePath('/cargo-napravleniya') },
  { label: t('nav.calculatorShort'), fullLabel: t('nav.calculator'), to: localePath('/cargo-kalkulyator') },
  { label: t('nav.documents'), to: localePath('/cargo-dokumenti') },
  { label: t('nav.faq'), to: localePath('/cargo-faq') },
  { label: t('nav.blog'), to: localePath('/cargo-blog') },
  { label: t('nav.contacts'), to: localePath('/cargo-kontakty') },
]);

const config = useRuntimeConfig();
const botUrl = config.public.botUrl as string;

// Контакты для футера и плавающих кнопок.
const phone = '+996552165165';
const phoneHref = `tel:${phone}`;
const whatsappHref = `https://wa.me/${phone.replace('+', '')}`;
const email = 'info@asdicargo.com';

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

// Подсветка активного пункта пилюльной навигации.
function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`);
}

// Сессия сайта: инициализируется клиентским плагином plugins/auth.client.ts.
const auth = useAuthStore();
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-steel-900 dark:bg-steel-950 dark:text-steel-100">
    <header
      class="sticky top-0 z-40 overflow-hidden border-b border-steel-200/70 bg-white/85 backdrop-blur-xl dark:border-steel-800/70 dark:bg-steel-950/80"
    >
      <!-- Декоративный градиентный уголок (как в референсе) -->
      <div
        class="pointer-events-none absolute -right-10 -top-16 h-40 w-72 rounded-full bg-brand-gradient opacity-15 blur-2xl dark:opacity-25"
        aria-hidden="true"
      />
      <div class="relative z-10 mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
        <!-- Логотип: левая колонка -->
        <div class="flex items-center">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5 text-4xl font-bold">
            <span class="inline-block h-10 w-2.5 rounded-full bg-brand-gradient" aria-hidden="true" />
            <span>As<span class="text-brand-600 dark:text-brand-400">Di</span> Cargo</span>
          </NuxtLink>
        </div>

        <!-- Пилюльная навигация: центральная колонка -->
        <nav class="hidden items-center justify-center gap-0.5 lg:flex">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition"
            :class="
              isActive(link.to)
                ? 'bg-brand-gradient text-white shadow-sm'
                : 'text-steel-600 hover:bg-steel-100 hover:text-steel-900 dark:text-steel-300 dark:hover:bg-steel-800/60 dark:hover:text-white'
            "
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Действия: правая колонка -->
        <div class="flex items-center justify-end gap-1.5">
          <LangSwitcher />
          <ThemeToggle />
          <ClientOnly>
            <NuxtLink
              v-if="auth.isAuthenticated"
              :to="localePath('/account')"
              class="hidden items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-steel-600 transition hover:text-brand-500 sm:flex dark:text-steel-300 dark:hover:text-brand-400"
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
              class="hidden rounded-full sm:inline-flex"
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
                class="hidden rounded-full sm:inline-flex"
              >
                {{ t('auth.loginButton') }}
              </UButton>
            </template>
          </ClientOnly>
          <UButton
            class="rounded-full lg:hidden"
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
          class="relative z-10 border-t border-steel-200/70 bg-white/95 backdrop-blur dark:border-steel-800/70 dark:bg-steel-950/95 lg:hidden"
        >
          <div class="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="rounded-full px-4 py-2.5 text-sm font-medium transition"
              :class="
                isActive(link.to)
                  ? 'bg-brand-gradient text-white'
                  : 'text-steel-700 hover:bg-steel-100 dark:text-steel-200 dark:hover:bg-steel-800/60'
              "
              @click="mobileOpen = false"
            >
              {{ link.fullLabel ?? link.label }}
            </NuxtLink>
            <ClientOnly>
              <UButton
                v-if="auth.isAuthenticated"
                :to="localePath('/account')"
                color="neutral"
                variant="soft"
                size="lg"
                icon="i-lucide-user"
                block
                class="mt-1 rounded-full"
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
                class="mt-1 rounded-full"
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
                  class="mt-1 rounded-full"
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

    <!-- Плавающие кнопки связи (WhatsApp + Telegram) -->
    <div class="fixed bottom-5 right-4 z-50 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      <a
        :href="whatsappHref"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        class="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 ring-4 ring-[#25D366]/20 transition hover:scale-105 hover:ring-[#25D366]/30 sm:size-14"
      >
        <UIcon name="i-lucide-message-circle" class="size-6 sm:size-7" />
      </a>
      <a
        :href="botUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        class="flex size-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg shadow-black/20 ring-4 ring-[#229ED9]/20 transition hover:scale-105 hover:ring-[#229ED9]/30 sm:size-14"
      >
        <UIcon name="i-lucide-send" class="size-6 sm:size-7" />
      </a>
    </div>

    <footer class="relative overflow-hidden bg-brand-steel-gradient text-white">
      <!-- Main footer grid -->
      <div class="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-lg font-semibold text-white">
            <span class="inline-block h-6 w-1.5 rounded-full bg-white/90" aria-hidden="true" />
            <span>AsDi Cargo</span>
          </NuxtLink>
          <p class="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            {{ t('footer.description') }}
          </p>
          <!-- Соцсети -->
          <div class="mt-5 flex items-center gap-3">
            <a
              :href="whatsappHref"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              class="flex size-10 items-center justify-center rounded-full border border-white/30 text-white/90 transition hover:border-white hover:bg-white/10"
            >
              <UIcon name="i-lucide-message-circle" class="size-5" />
            </a>
            <a
              :href="botUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              class="flex size-10 items-center justify-center rounded-full border border-white/30 text-white/90 transition hover:border-white hover:bg-white/10"
            >
              <UIcon name="i-lucide-send" class="size-5" />
            </a>
            <a
              :href="`mailto:${email}`"
              aria-label="E-mail"
              class="flex size-10 items-center justify-center rounded-full border border-white/30 text-white/90 transition hover:border-white hover:bg-white/10"
            >
              <UIcon name="i-lucide-mail" class="size-5" />
            </a>
          </div>
        </div>

        <!-- Services -->
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {{ t('footer.servicesTitle') }}
          </h4>
          <ul class="space-y-2.5 text-sm text-white/70">
            <li>{{ t('footer.s1') }}</li>
            <li>{{ t('footer.s2') }}</li>
            <li>{{ t('footer.s3') }}</li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {{ t('footer.companyTitle') }}
          </h4>
          <ul class="space-y-2.5 text-sm">
            <li><NuxtLink :to="localePath('/cargo-o-nas')" class="text-white/70 transition hover:text-white">{{ t('footer.about') }}</NuxtLink></li>
            <li><NuxtLink :to="{ path: localePath('/'), hash: '#reviews' }" class="text-white/70 transition hover:text-white">{{ t('footer.reviews') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-faq')" class="text-white/70 transition hover:text-white">{{ t('footer.faq') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-dokumenti')" class="text-white/70 transition hover:text-white">{{ t('footer.documents') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-blog')" class="text-white/70 transition hover:text-white">{{ t('footer.blog') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cargo-kontakty')" class="text-white/70 transition hover:text-white">{{ t('footer.contacts') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Contacts -->
        <div>
          <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            {{ t('footer.contactsTitle') }}
          </h4>
          <ul class="space-y-3 text-sm text-white/70">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-map-pin" class="mt-0.5 size-4 shrink-0 text-white/90" />
              <span>{{ t('footer.address') }}</span>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-phone" class="size-4 shrink-0 text-white/90" />
              <a :href="phoneHref" class="transition hover:text-white">+996 552 165 165</a>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-mail" class="size-4 shrink-0 text-white/90" />
              <a :href="`mailto:${email}`" class="transition hover:text-white">{{ email }}</a>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="size-4 shrink-0 text-white/90" />
              <span>09:00–19:00 (+6 GMT)</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="relative z-10 border-t border-white/15">
        <div
          class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row"
        >
          <span>{{ t('footer.copyright') }}</span>
          <span
            v-if="versionLabel"
            class="select-none text-transparent transition-colors duration-300 hover:text-white/60"
          >
            {{ versionLabel }}
          </span>
        </div>
      </div>
    </footer>

    <CookieBanner />
  </div>
</template>
