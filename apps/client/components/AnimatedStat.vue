<script setup lang="ts">
/**
 * Плашка секции «AsDi Cargo в цифрах»: анимированный счётчик числовой части
 * значения (напр. «10 000+» → считает 0 → 10 000, суффикс «+» остаётся статичным).
 * Анимация запускается один раз, когда блок появляется во вьюпорте.
 */
const props = defineProps<{ value: string; label: string }>();

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
    const elapsed = Math.min((now - start) / duration, 1);
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
  <div ref="el" class="text-center">
    <div class="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
      {{ displayValue }}
    </div>
    <div class="mx-auto mt-3 h-1 w-10 rounded-full bg-brand-gradient" />
    <p class="mt-3 text-sm text-steel-300">{{ label }}</p>
  </div>
</template>
