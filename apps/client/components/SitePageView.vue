<script setup lang="ts">
/**
 * Рендер контентной страницы, редактируемой из админки. Контент тянется по
 * слагу на сервере (SSR); 404, если страница не найдена или снята с публикации.
 *
 * Оформление: градиентная шапка страницы (в стиле лендинга) + карточка контента.
 * Для страниц формата «вопрос-ответ» (prop `faq`) блоки `<h3>вопрос</h3>` с
 * идущим за ними ответом превращаются в аккордеон.
 */
interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
}

const props = defineProps<{ slug: string; image?: string; faq?: boolean }>();

const config = useRuntimeConfig();
const base = (import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl) as string;

const { locale } = useI18n();
const { data: page } = await useFetch<SitePage>(
  () => `${base}/pages/slug/${props.slug}?language=${locale.value}`,
  { key: () => `site-page-${props.slug}-${locale.value}` },
);

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Страница не найдена', fatal: true });
}

const description = computed(() =>
  (page.value?.content ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160),
);

useSeoMeta({
  title: () => (page.value ? `${page.value.title} — AsDi Cargo` : 'AsDi Cargo'),
  description,
  ogTitle: () => page.value?.title ?? '',
  ogDescription: description,
});

// Страница существует во всех локалях (контент общий) — отдаём hreflang.
const seoAlternates = useSeoAlternates();
useHead(() => ({ link: seoAlternates.value }));

// Контент до первого вопроса (вводный h2/абзац) рендерим как обычный HTML.
const faqIntro = computed(() => {
  const html = page.value?.content ?? '';
  const idx = html.search(/<h3[\s>]/i);
  return idx === -1 ? html : html.slice(0, idx);
});

// Разбиваем контент на пары вопрос (h3) → ответ (HTML до следующего h3).
const faqItems = computed(() => {
  const html = page.value?.content ?? '';
  const segments = html.split(/<h3[^>]*>/i).slice(1);
  const items: Array<{ label: string; content: string; value: string }> = [];
  segments.forEach((segment, index) => {
    const closeIdx = segment.indexOf('</h3>');
    if (closeIdx === -1) return;
    const label = segment
      .slice(0, closeIdx)
      .replace(/<[^>]*>/g, '')
      .trim();
    const body = segment.slice(closeIdx + '</h3>'.length).trim();
    if (!label) return;
    items.push({ label, content: body, value: `faq-${index}` });
  });
  return items;
});

const showAccordion = computed(() => props.faq && faqItems.value.length > 0);
</script>

<template>
  <div v-if="page">
    <!-- Шапка страницы с фоновым фото -->
    <PageHero :image="image">
      <h1 class="text-3xl font-bold leading-tight text-white sm:text-4xl">
        {{ page.title }}
      </h1>
    </PageHero>

    <!-- Контент -->
    <section class="mx-auto w-full max-w-3xl px-4 py-12">
      <article
        class="rounded-brand-lg border border-steel-200 bg-white p-6 shadow-sm sm:p-8 dark:border-steel-800 dark:bg-steel-900/40"
      >
        <template v-if="showAccordion">
          <div
            v-if="faqIntro.trim()"
            class="prose mb-6 max-w-none dark:prose-invert"
            v-html="faqIntro"
          />
          <UAccordion
            :items="faqItems"
            type="multiple"
            :ui="{
              item: 'border border-steel-200 dark:border-steel-800 rounded-brand-lg mb-3 last:mb-0 px-4',
              trigger: 'py-4 font-semibold',
            }"
          >
            <template #body="{ item }">
              <div class="prose max-w-none pb-2 dark:prose-invert" v-html="item.content" />
            </template>
          </UAccordion>
        </template>

        <div v-else class="prose max-w-none dark:prose-invert" v-html="page.content" />
      </article>
    </section>
  </div>
</template>
