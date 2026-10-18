<script setup lang="ts">
/**
 * «Закажите обратный звонок». Отдельного бэкенда для заявок на звонок нет,
 * поэтому форма честно открывает WhatsApp менеджера с заполненным сообщением.
 */
const WHATSAPP_PHONE = '996552165165';
const TYPES = ['delivery', 'status', 'docs', 'other'] as const;

const { t } = useI18n();
const localePath = useLocalePath();
const type = ref<(typeof TYPES)[number]>('delivery');
const name = ref('');
const phone = ref('');
const submitted = ref(false);

const errors = computed(() => ({
  name: name.value.trim() ? null : t('site.contact.errName'),
  phone: /^\+?[\d\s()-]{7,20}$/.test(phone.value.trim()) ? null : t('site.contact.errPhone'),
}));

const typeItems = computed(() =>
  TYPES.map((value) => ({ label: t(`site.contact.types.${value}`), value })),
);

function submit(): void {
  submitted.value = true;
  if (errors.value.name || errors.value.phone) return;
  const text = t('site.contact.message', {
    type: t(`site.contact.types.${type.value}`),
    name: name.value.trim(),
    phone: phone.value.trim(),
  });
  const params = new URLSearchParams({
    phone: WHATSAPP_PHONE,
    type: 'phone_number',
    app_absent: '0',
    text,
  });
  window.open(`https://api.whatsapp.com/send/?${params.toString()}`, '_blank', 'noopener');
}
</script>

<template>
  <div class="rounded-[1.5rem] bg-brand-500 p-5 text-white sm:p-8">
    <h3 class="text-xl font-bold sm:text-2xl">{{ t('site.contact.callbackTitle') }}</h3>
    <p class="mt-1 text-sm text-white/80">{{ t('site.contact.callbackSub') }}</p>
    <form class="mt-5 grid gap-3 sm:grid-cols-3" @submit.prevent="submit">
      <USelectMenu
        v-model="type"
        :items="typeItems"
        value-key="value"
        :search-input="false"
        :aria-label="t('site.contact.type')"
        size="xl"
        class="w-full"
        :ui="{ base: 'rounded-[0.9375rem] bg-white text-steel-900 ring-0' }"
      />
      <div>
        <input
          v-model="name"
          type="text"
          autocomplete="name"
          :placeholder="t('site.contact.name')"
          class="w-full rounded-[0.9375rem] bg-white px-4 py-3 text-sm text-steel-900 outline-none placeholder:text-steel-400"
        />
        <p v-if="submitted && errors.name" class="mt-1 text-xs text-white/90">{{ errors.name }}</p>
      </div>
      <div>
        <input
          v-model="phone"
          type="tel"
          autocomplete="tel"
          placeholder="+996 555 123 456"
          :aria-label="t('site.contact.phone')"
          class="w-full rounded-[0.9375rem] bg-white px-4 py-3 text-sm text-steel-900 outline-none placeholder:text-steel-400"
        />
        <p v-if="submitted && errors.phone" class="mt-1 text-xs text-white/90">{{ errors.phone }}</p>
      </div>
      <div class="flex flex-col gap-3 sm:col-span-3 sm:flex-row sm:items-center">
        <button type="submit" class="btn-ink shrink-0 whitespace-nowrap sm:w-auto">
          <UIcon name="i-lucide-message-circle" class="size-5" />
          {{ t('site.contact.submit') }}
        </button>
        <p class="text-xs text-white/70">
          {{ t('site.privacy.consentPrefix') }}
          <NuxtLink :to="localePath('/politika-konfidentsialnosti')" class="underline underline-offset-2 hover:text-white">
            {{ t('site.privacy.consentLink') }}
          </NuxtLink>
        </p>
      </div>
    </form>
  </div>
</template>
