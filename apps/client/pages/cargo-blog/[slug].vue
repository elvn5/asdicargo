<script setup lang="ts">
interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  language: string;
}

const route = useRoute();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const base = (import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl) as string;
const slug = computed(() => String(route.params.slug));

// SSR: пост загружается на сервере; 404, если не найден/не опубликован.
const { data: post } = await useFetch<Post>(() => `${base}/posts/slug/${slug.value}`, {
  key: () => `post-${slug.value}`,
});

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Публикация не найдена', fatal: true });
}

const dtLocale = computed(
  () =>
    (({ ru: 'ru-RU', ky: 'ky-KG', en: 'en-US' }) as Record<string, string>)[locale.value] ??
    'ru-RU',
);
const formattedDate = computed(() =>
  post.value?.publishedAt
    ? new Date(post.value.publishedAt).toLocaleDateString(dtLocale.value, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '',
);

useSeoMeta({
  title: () => (post.value ? `${post.value.title} — AsDi Cargo` : 'AsDi Cargo'),
  description: () => post.value?.excerpt ?? '',
  ogTitle: () => post.value?.title ?? '',
  ogDescription: () => post.value?.excerpt ?? '',
  ogType: 'article',
  ogImage: () => post.value?.coverImageUrl ?? '',
});

const siteUrl = String(config.public.siteUrl ?? 'https://asdicargo.com').replace(/\/$/, '');
const articleLd = computed(() =>
  post.value
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value.title,
        description: post.value.excerpt ?? undefined,
        image: post.value.coverImageUrl ?? undefined,
        datePublished: post.value.publishedAt ?? undefined,
        inLanguage: post.value.language,
        mainEntityOfPage: siteUrl + route.path,
        author: { '@type': 'Organization', name: 'AsDi Cargo' },
        publisher: { '@type': 'Organization', name: 'AsDi Cargo', url: siteUrl },
      })
    : '',
);
useHead(() => ({
  script: articleLd.value ? [{ type: 'application/ld+json', innerHTML: articleLd.value }] : [],
}));
</script>

<template>
  <div class="space-y-2">
    <section class="site-panel">
      <div class="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
        <nav class="flex items-center gap-1.5 text-xs text-steel-500 dark:text-steel-400" aria-label="Breadcrumb">
          <NuxtLink :to="localePath('/')" class="hover:text-brand-600">{{ t('site.breadcrumbs.home') }}</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          <NuxtLink :to="localePath('/cargo-blog')" class="hover:text-brand-600">{{ t('blog.title') }}</NuxtLink>
        </nav>

        <article v-if="post" class="prose mt-6 max-w-none dark:prose-invert">
          <header class="not-prose mb-8">
            <h1 class="site-heading text-3xl text-steel-950 sm:text-[2.5rem] dark:text-steel-100">
              {{ post.title }}
            </h1>
            <time
              v-if="post.publishedAt"
              :datetime="post.publishedAt"
              class="mt-3 block text-sm text-steel-500 dark:text-steel-400"
            >
              {{ formattedDate }}
            </time>
          </header>

          <img v-if="post.coverImageUrl" :src="post.coverImageUrl" :alt="post.title" class="w-full rounded-[1.5rem]" />

          <!-- Семантический HTML из редактора (h2/p/ul/blockquote/…), отрендеренный на сервере -->
          <div v-html="post.content" />
        </article>
      </div>
    </section>
  </div>
</template>
