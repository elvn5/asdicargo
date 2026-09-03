<script setup lang="ts">
useHead({
  title: 'AsDi Cargo — доставка грузов и посылок',
  meta: [
    {
      name: 'description',
      content:
        'AsDi Cargo — доставка грузов и посылок. Персональный адрес склада, отслеживание и выдача через Telegram-бота.',
    },
  ],
});

const config = useRuntimeConfig();
const botUrl = config.public.botUrl as string;

const services = [
  {
    icon: 'i-lucide-package',
    title: 'Приём посылок',
    text: 'Персональный адрес на складе — оформляйте покупки и получайте их у нас.',
  },
  {
    icon: 'i-lucide-truck',
    title: 'Доставка грузов',
    text: 'Быстрая и надёжная перевозка от склада до вашего города.',
  },
  {
    icon: 'i-lucide-map-pin',
    title: 'Пункты выдачи',
    text: 'Удобные адреса для получения — выбирайте ближайший к вам.',
  },
];

const steps = [
  { n: '01', title: 'Регистрация', text: 'Запустите Telegram-бота и получите персональный адрес склада.' },
  { n: '02', title: 'Заказ', text: 'Укажите наш адрес при оформлении покупки в магазине.' },
  { n: '03', title: 'Отслеживание', text: 'Следите за статусом посылки в реальном времени.' },
  { n: '04', title: 'Выдача', text: 'Заберите заказ в удобном пункте, как только он придёт.' },
];
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-steel-50 dark:from-steel-950 dark:via-steel-950 dark:to-steel-900"
      />
      <div class="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
        <div>
          <UBadge color="primary" variant="soft" class="mb-4">Доставка из-за рубежа</UBadge>
          <h1 class="text-4xl font-bold leading-tight sm:text-5xl">
            Ваши посылки —
            <span class="text-brand-600 dark:text-brand-400">под надёжной защитой</span>
          </h1>
          <p class="mt-4 max-w-md text-lg text-steel-600 dark:text-steel-300">
            AsDi Cargo принимает, перевозит и выдаёт ваши грузы. Оформление и отслеживание —
            прямо в Telegram.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton :to="botUrl" target="_blank" size="lg" icon="i-lucide-send" color="primary">
              Начать в Telegram
            </UButton>
            <UButton to="#how" size="lg" color="neutral" variant="outline">Как это работает</UButton>
          </div>
        </div>

        <div class="relative">
          <div
            class="rounded-2xl border border-steel-200 bg-white p-6 shadow-xl shadow-steel-900/5 dark:border-steel-800 dark:bg-steel-900"
          >
            <div class="flex items-center gap-3">
              <span class="flex size-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                <UIcon name="i-lucide-package-check" class="size-6" />
              </span>
              <div>
                <p class="font-semibold">Посылка №AC-2048</p>
                <p class="text-sm text-steel-500 dark:text-steel-400">Готова к выдаче</p>
              </div>
              <UBadge color="primary" variant="subtle" class="ml-auto">В пути → Выдача</UBadge>
            </div>
            <div class="mt-5 space-y-3">
              <div v-for="s in ['Создана', 'На складе', 'В пути', 'Готова к выдаче']" :key="s" class="flex items-center gap-3">
                <span class="size-2.5 rounded-full bg-brand-500" aria-hidden="true" />
                <span class="text-sm text-steel-600 dark:text-steel-300">{{ s }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 class="text-2xl font-bold sm:text-3xl">Услуги</h2>
      <p class="mt-2 text-steel-600 dark:text-steel-300">Всё для доставки ваших покупок и грузов.</p>
      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="service in services" :key="service.title">
          <span class="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <UIcon :name="service.icon" class="size-6" />
          </span>
          <h3 class="mt-4 text-lg font-semibold">{{ service.title }}</h3>
          <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ service.text }}</p>
        </UCard>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="border-y border-steel-200 bg-steel-50 dark:border-steel-800 dark:bg-steel-900/40">
      <div class="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 class="text-2xl font-bold sm:text-3xl">Как это работает</h2>
        <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="step in steps" :key="step.n" class="relative">
            <span class="text-4xl font-bold text-brand-500/30 dark:text-brand-400/30">{{ step.n }}</span>
            <h3 class="mt-2 text-lg font-semibold">{{ step.title }}</h3>
            <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA / Contacts -->
    <section id="contacts" class="mx-auto w-full max-w-6xl px-4 py-20">
      <div
        class="flex flex-col items-center gap-6 rounded-2xl bg-brand-600 px-6 py-12 text-center text-white dark:bg-brand-700"
      >
        <h2 class="max-w-xl text-2xl font-bold sm:text-3xl">Готовы отправить первую посылку?</h2>
        <p class="max-w-lg text-brand-50/90">
          Запустите бота, получите персональный адрес склада и оформите доставку за пару минут.
        </p>
        <UButton :to="botUrl" target="_blank" size="lg" color="neutral" variant="solid" icon="i-lucide-send">
          Открыть Telegram-бота
        </UButton>
      </div>
    </section>
  </div>
</template>
