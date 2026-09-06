<script setup lang="ts">
/**
 * Рендер контентной страницы, редактируемой из админки. Контент тянется по
 * слагу на сервере (SSR); 404, если страница не найдена или снята с публикации.
 */
interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
}

const props = defineProps<{ slug: string }>();

const config = useRuntimeConfig();
const base = (import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl) as string;

const { data: page } = await useFetch<SitePage>(() => `${base}/pages/slug/${props.slug}`, {
  key: () => `site-page-${props.slug}`,
});

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
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-12">
    <article v-if="page" class="prose max-w-none dark:prose-invert">
      <h1 class="not-prose mb-8 text-3xl font-bold leading-tight text-steel-900 sm:text-4xl dark:text-steel-100">
        {{ page.title }}
      </h1>
      <!-- Семантический HTML из редактора (h2/p/ul/blockquote/…), отрендеренный на сервере -->
      <div v-html="page.content" />
    </article>
  </section>
</template>
