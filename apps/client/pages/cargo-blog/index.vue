<script setup lang="ts">
interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  language: string;
}

const { t, locale } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const base = (import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl) as string;

// SSR: список тянется на сервере до отрисовки, фильтр по текущему языку интерфейса.
const { data: posts } = await useFetch<PostListItem[]>(
  () => `${base}/posts?language=${locale.value}`,
  { key: () => `posts-${locale.value}`, default: () => [] },
);

const dtLocale = computed(
  () =>
    (({ ru: 'ru-RU', ky: 'ky-KG', en: 'en-US' }) as Record<string, string>)[locale.value] ??
    'ru-RU',
);
function fmt(d: string | null): string {
  return d
    ? new Date(d).toLocaleDateString(dtLocale.value, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
}

useSeoMeta({
  title: () => `${t('blog.title')} — AsDi Cargo`,
  description: () => t('blog.subtitle'),
  ogTitle: () => `${t('blog.title')} — AsDi Cargo`,
  ogDescription: () => t('blog.subtitle'),
});

// hreflang для всех локалей списка блога
const seoAlternates = useSeoAlternates();
useHead(() => ({ link: seoAlternates.value }));
</script>

<template>
  <div class="space-y-2">
    <PageHero :title="t('blog.title')" :subtitle="t('blog.subtitle')" />

    <SitePanel tone="soft">
      <p v-if="!posts || posts.length === 0" class="text-steel-500 dark:text-steel-400">
        {{ t('blog.empty') }}
      </p>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="post in posts"
          :key="post.id"
          class="site-card-white group overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]"
        >
          <NuxtLink :to="localePath(`/cargo-blog/${post.slug}`)" class="flex h-full flex-col">
            <img
              v-if="post.coverImageUrl"
              :src="post.coverImageUrl"
              :alt="post.title"
              loading="lazy"
              class="aspect-video w-full object-cover"
            />
            <div class="flex flex-1 flex-col p-5">
              <time
                v-if="post.publishedAt"
                :datetime="post.publishedAt"
                class="text-xs uppercase tracking-wide text-steel-400"
              >
                {{ fmt(post.publishedAt) }}
              </time>
              <h2 class="mt-2 text-lg font-bold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {{ post.title }}
              </h2>
              <p v-if="post.excerpt" class="mt-2 line-clamp-3 text-sm text-steel-600 dark:text-steel-300">
                {{ post.excerpt }}
              </p>
              <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                {{ t('blog.readMore') }} <UIcon name="i-lucide-arrow-right" class="size-4" />
              </span>
            </div>
          </NuxtLink>
        </article>
      </div>
    </SitePanel>
  </div>
</template>
