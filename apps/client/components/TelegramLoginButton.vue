<script setup lang="ts">
import type { TelegramAuthData } from '~/shared/api/types';

const props = withDefaults(
  defineProps<{
    botUsername: string;
    size?: 'large' | 'medium' | 'small';
    radius?: number;
    requestAccess?: boolean;
  }>(),
  { size: 'large', radius: 8, requestAccess: true },
);

const emit = defineEmits<{ auth: [data: TelegramAuthData] }>();

const container = ref<HTMLElement | null>(null);
// Уникальное имя глобального колбэка для нескольких инстансов виджета.
const callbackName = `onTelegramAuth_${Math.random().toString(36).slice(2)}`;

onMounted(() => {
  if (!props.botUsername || !container.value) return;

  (window as unknown as Record<string, unknown>)[callbackName] = (user: TelegramAuthData) => {
    emit('auth', user);
  };

  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.async = true;
  script.setAttribute('data-telegram-login', props.botUsername);
  script.setAttribute('data-size', props.size);
  script.setAttribute('data-radius', String(props.radius));
  script.setAttribute('data-onauth', `${callbackName}(user)`);
  if (props.requestAccess) {
    script.setAttribute('data-request-access', 'write');
  }
  container.value.appendChild(script);
});

onBeforeUnmount(() => {
  delete (window as unknown as Record<string, unknown>)[callbackName];
});
</script>

<template>
  <div ref="container" class="flex justify-center" />
</template>
