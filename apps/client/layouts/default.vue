<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
const localePath = useLocalePath();

// Каждый пункт ведёт на отдельную cargo-страницу.
const links = computed(
  (): Array<{ label: string; to: string }> => [
    { label: t('nav.services'), to: localePath('/cargo-uslugi') },
    { label: t('nav.directions'), to: localePath('/cargo-napravleniya') },
    { label: t('nav.calculatorShort'), to: localePath('/cargo-kalkulyator') },
    { label: t('nav.documents'), to: localePath('/cargo-dokumenti') },
    { label: t('nav.faq'), to: localePath('/cargo-faq') },
    { label: t('nav.blog'), to: localePath('/cargo-blog') },
    { label: t('nav.contacts'), to: localePath('/cargo-kontakty') },
  ],
);

const config = useRuntimeConfig();

// Контакты для шапки, футера и плавающих кнопок.
const phone = '+996552165165';
const phoneLabel = '+996 552 165 165';
const phoneHref = `tel:${phone}`;
const whatsappHref = `https://wa.me/${phone.replace('+', '')}`;
const email = 'info@asdicargo.com';
// Личный контакт менеджера — кнопки Telegram ведут сюда напрямую.
const telegramContactHref = 'https://t.me/kalita_lida';

// Версия задеплоенного образа (пусто в локальной разработке — тогда не показываем).
const version = String(config.public.appVersion ?? '');
const versionLabel = /^\d/.test(version) ? `v${version}` : version;

// Мобильное меню
const mobileOpen = ref(false);
const route = useRoute();
// В кабинете на мобильных снизу закреплено меню — поднимаем плавающие кнопки над ним.
const hasAccountNav = computed(() => route.path.includes('/account'));
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`);
}

// Сессия сайта: инициализируется клиентским плагином plugins/auth.client.ts.
const auth = useAuthStore();
const accountLink = computed(() => localePath(auth.isAuthenticated ? '/account' : '/login'));

const footerColumns = computed(() => [
  {
    title: t('footer.servicesTitle'),
    items: [
      { label: t('nav.services'), to: localePath('/cargo-uslugi') },
      { label: t('nav.directions'), to: localePath('/cargo-napravleniya') },
      { label: t('site.footerExtra.calculator'), to: localePath('/cargo-kalkulyator') },
      { label: t('site.footerExtra.tracking'), to: `${localePath('/')}#tracking` },
    ],
  },
  {
    title: t('site.footerExtra.clients'),
    items: [
      { label: t('site.footerExtra.account'), to: localePath('/account') },
      { label: t('footer.documents'), to: localePath('/cargo-dokumenti') },
      { label: t('footer.faq'), to: localePath('/cargo-faq') },
      { label: t('footer.blog'), to: localePath('/cargo-blog') },
    ],
  },
  {
    title: t('footer.companyTitle'),
    items: [
      { label: t('footer.about'), to: localePath('/cargo-o-nas') },
      { label: t('footer.reviews'), to: `${localePath('/')}#reviews` },
      { label: t('footer.contacts'), to: localePath('/cargo-kontakty') },
    ],
  },
]);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-page text-steel-950 dark:bg-steel-950 dark:text-steel-100">
    <!-- Красная плашка сверху -->
    <div class="mx-auto w-full max-w-[1320px] px-2 pt-2 sm:px-3">
      <a
        :href="whatsappHref"
        target="_blank"
        rel="noopener noreferrer"
        class="block rounded-full bg-brand-500 px-4 py-2 text-center text-xs text-white transition hover:bg-brand-600 sm:text-sm"
      >
        {{ t('site.topbar.text') }}
        <span class="font-semibold underline underline-offset-2">{{ t('site.topbar.link') }}</span>
      </a>
    </div>

    <!-- Шапка -->
    <header class="sticky top-0 z-40 mx-auto w-full max-w-[1320px] px-2 pt-2 sm:px-3">
      <div class="site-panel shadow-[0_8px_24px_-16px_rgba(0,0,0,0.25)]">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <!-- Служебная строка (десктоп) -->
          <div class="hidden items-center justify-between border-b border-steel-100 py-2 text-xs lg:flex dark:border-steel-800">
            <div class="flex items-center gap-1.5 text-steel-600 dark:text-steel-300">
              <UIcon name="i-lucide-map-pin" class="size-4 text-brand-500" />
              <span class="font-semibold text-steel-900 dark:text-white">{{ t('site.header.location') }}</span>
              <span aria-hidden="true">·</span>
              <NuxtLink :to="localePath('/cargo-kontakty')" class="text-brand-600 hover:underline dark:text-brand-400">
                {{ t('site.header.points') }}
              </NuxtLink>
            </div>
            <div class="flex items-center gap-4 text-steel-700 dark:text-steel-200">
              <NuxtLink :to="`${localePath('/')}#contact`" class="font-medium hover:text-brand-600">
                {{ t('site.header.callback') }}
              </NuxtLink>
              <span class="h-3 w-px bg-steel-200 dark:bg-steel-700" aria-hidden="true" />
              <a :href="phoneHref" class="font-semibold hover:text-brand-600">{{ phoneLabel }}</a>
              <a :href="whatsappHref" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="flex size-6 items-center justify-center rounded-full bg-[#25D366] text-white">
                <UIcon name="i-lucide-message-circle" class="size-3.5" />
              </a>
              <a :href="telegramContactHref" target="_blank" rel="noopener noreferrer" aria-label="Telegram" class="flex size-6 items-center justify-center rounded-full bg-[#229ED9] text-white">
                <UIcon name="i-lucide-send" class="size-3.5" />
              </a>
              <span class="h-3 w-px bg-steel-200 dark:bg-steel-700" aria-hidden="true" />
              <LangSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <!-- Основная строка -->
          <div class="flex h-16 items-center gap-4 lg:h-[4.5rem]">
            <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center gap-2 text-2xl font-extrabold tracking-tight">
              <span class="inline-block h-7 w-2 rounded-full bg-brand-gradient" aria-hidden="true" />
              <span>As<span class="text-brand-600 dark:text-brand-400">Di</span> Cargo</span>
            </NuxtLink>

            <nav class="ml-auto hidden items-center gap-1 lg:flex">
              <NuxtLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition"
                :class="
                  isActive(link.to)
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-steel-700 hover:text-brand-600 dark:text-steel-200 dark:hover:text-brand-400'
                "
              >
                {{ link.label }}
              </NuxtLink>
            </nav>

            <div class="ml-auto flex items-center gap-2 lg:ml-2">
              <div class="flex items-center gap-1 lg:hidden">
                <LangSwitcher />
                <ThemeToggle />
              </div>
              <!-- Чёрная кнопка кабинета -->
              <ClientOnly>
                <NuxtLink
                  :to="accountLink"
                  :aria-label="t('site.header.account')"
                  :title="auth.isAuthenticated ? auth.displayName : t('site.header.account')"
                  class="flex size-11 items-center justify-center rounded-[0.875rem] bg-[#181818] text-white transition hover:bg-black dark:bg-white dark:text-steel-950"
                >
                  <UIcon name="i-lucide-user-round" class="size-5" />
                </NuxtLink>
                <template #fallback>
                  <span class="block size-11 rounded-[0.875rem] bg-[#181818] dark:bg-white" aria-hidden="true" />
                </template>
              </ClientOnly>
              <button
                type="button"
                class="flex size-11 items-center justify-center rounded-[0.875rem] bg-steel-100 text-steel-800 transition hover:bg-steel-200 lg:hidden dark:bg-steel-800 dark:text-steel-100"
                :aria-label="t('header.menu')"
                :aria-expanded="mobileOpen"
                @click="mobileOpen = !mobileOpen"
              >
                <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
              </button>
            </div>
          </div>

          <!-- Мобильное меню -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <nav v-if="mobileOpen" class="border-t border-steel-100 py-3 lg:hidden dark:border-steel-800">
              <NuxtLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="block rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                :class="
                  isActive(link.to)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-steel-800 hover:bg-steel-50 dark:text-steel-100 dark:hover:bg-steel-800'
                "
              >
                {{ link.label }}
              </NuxtLink>
              <div class="mt-3 flex flex-wrap gap-2 border-t border-steel-100 pt-3 dark:border-steel-800">
                <a :href="phoneHref" class="site-card px-4 py-2.5 text-sm font-semibold">{{ phoneLabel }}</a>
                <a :href="whatsappHref" target="_blank" rel="noopener noreferrer" class="site-card px-4 py-2.5 text-sm font-semibold">WhatsApp</a>
                <a :href="telegramContactHref" target="_blank" rel="noopener noreferrer" class="site-card px-4 py-2.5 text-sm font-semibold">Telegram</a>
              </div>
            </nav>
          </Transition>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-[1320px] flex-1 px-2 py-2 sm:px-3">
      <slot />
    </main>

    <!-- Плавающие кнопки связи (WhatsApp + Telegram) -->
    <div
      class="fixed right-4 z-50 flex flex-col gap-3 sm:right-6"
      :class="hasAccountNav ? 'bottom-24 lg:bottom-6' : 'bottom-5 sm:bottom-6'"
    >
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
        :href="telegramContactHref"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        class="flex size-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-lg shadow-black/20 ring-4 ring-[#229ED9]/20 transition hover:scale-105 hover:ring-[#229ED9]/30 sm:size-14"
      >
        <UIcon name="i-lucide-send" class="size-6 sm:size-7" />
      </a>
    </div>

    <!-- Подвал -->
    <footer class="mx-auto w-full max-w-[1320px] px-2 sm:px-3">
      <div class="rounded-t-[1.875rem] bg-[#2f2f2f] text-white">
        <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.3fr]">
          <!-- Бренд -->
          <div class="sm:col-span-2 lg:col-span-1">
            <NuxtLink :to="localePath('/')" class="flex items-center gap-2 text-xl font-extrabold">
              <span class="inline-block h-6 w-1.5 rounded-full bg-brand-gradient" aria-hidden="true" />
              <span>AsDi Cargo</span>
            </NuxtLink>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-white/60">{{ t('footer.description') }}</p>
          </div>

          <!-- Колонки ссылок -->
          <div v-for="col in footerColumns" :key="col.title">
            <h4 class="mb-4 text-sm font-bold">{{ col.title }}</h4>
            <ul class="space-y-2.5 text-sm">
              <li v-for="item in col.items" :key="item.label">
                <NuxtLink :to="item.to" class="text-white/60 transition hover:text-white">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Контакты -->
          <div>
            <h4 class="mb-4 text-sm font-bold">{{ t('footer.contactsTitle') }}</h4>
            <ul class="space-y-3 text-sm text-white/60">
              <li>
                <a :href="phoneHref" class="text-base font-bold text-white hover:text-brand-300">{{ phoneLabel }}</a>
              </li>
              <li>
                <a :href="`mailto:${email}`" class="transition hover:text-white">{{ email }}</a>
              </li>
              <li>{{ t('footer.address') }}</li>
              <li>09:00–19:00 (GMT+6)</li>
            </ul>
            <div class="mt-4 flex items-center gap-2">
              <a :href="whatsappHref" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="flex size-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20">
                <UIcon name="i-lucide-message-circle" class="size-5" />
              </a>
              <a :href="telegramContactHref" target="_blank" rel="noopener noreferrer" aria-label="Telegram" class="flex size-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20">
                <UIcon name="i-lucide-send" class="size-5" />
              </a>
              <a :href="`mailto:${email}`" aria-label="E-mail" class="flex size-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20">
                <UIcon name="i-lucide-mail" class="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-white/10">
          <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row sm:px-8">
            <span>{{ t('footer.copyright') }}</span>
            <span v-if="versionLabel" class="select-none text-transparent transition-colors duration-300 hover:text-white/50">
              {{ versionLabel }}
            </span>
          </div>
        </div>
      </div>
    </footer>

    <CookieBanner />
  </div>
</template>
