<script setup lang="ts">
/**
 * Плашка секции «AsDi Cargo в цифрах»: анимированный счётчик числовой части
 * значения (напр. «10 000+» → считает 0 → 10 000, суффикс «+» остаётся статичным).
 * Анимация запускается один раз, когда блок появляется во вьюпорте.
 */
const props = defineProps<{ value: string; label: string; icon?: string }>();

const el = ref<HTMLElement | null>(null);
const displayValue = ref(props.value);

// Разбираем значение на числовую часть (с разделителями) и суффикс.
const parsed = computed(() => {
  const match = props.value.match(/^(-?[\d\s,. ]+)(.*)$/);
  if (!match) return null;
  const numericRaw = match[1] ?? '';
  const suffix = match[2] ?? '';
  const separator = numericRaw.includes(',')
    ? ','
    : numericRaw.includes(' ') || numericRaw.includes(' ')
      ? ' '
      : '';
  const target = Number.parseInt(numericRaw.replace(/[^\d]/g, ''), 10);
  if (Number.isNaN(target)) return null;
  return { target, suffix, separator };
});

function format(n: number, separator: string): string {
  const digits = Math.round(n).toString();
  if (!separator) return digits;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

let animated = false;

function animate(): void {
  if (animated || !parsed.value) return;
  animated = true;
  const { target, suffix, separator } = parsed.value;
  const duration = 1200;
  const start = performance.now();

  function tick(now: number): void {
    // Метка кадра rAF бывает чуть раньше start — без нижней границы прогресс
    // уходит в минус, и счётчик на мгновение показывает отрицательное число.
    const elapsed = Math.min(Math.max((now - start) / duration, 0), 1);
    const eased = 1 - (1 - elapsed) ** 3;
    displayValue.value = `${format(target * eased, separator)}${suffix}`;
    if (elapsed < 1) {
      requestAnimationFrame(tick);
    } else {
      displayValue.value = props.value;
    }
  }

  requestAnimationFrame(tick);
}

onMounted(() => {
  if (!parsed.value) return;
  displayValue.value = `${format(0, parsed.value.separator)}${parsed.value.suffix}`;
  const { stop } = useIntersectionObserver(
    el,
    ([entry]) => {
      if (entry?.isIntersecting) {
        animate();
        stop();
      }
    },
    { threshold: 0.4 },
  );
});
</script>

<template>
  <div ref="el" class="site-card p-5 sm:p-6">
    <div v-if="icon" class="flex size-10 items-center justify-center rounded-full bg-brand-500 text-white">
      <UIcon :name="icon" class="size-5" />
    </div>
    <div class="mt-4 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
      {{ displayValue }}
    </div>
    <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ label }}</p>
  </div>
</template>
