<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import type * as Leaflet from 'leaflet';
import type { CompanyPoint } from '~/types/api';

/**
 * Карта точек компании на Leaflet + OpenStreetMap (без API-ключей).
 * Leaflet обращается к window при импорте, поэтому грузим его динамически
 * в onMounted (не .client.vue: там onMounted срабатывает до появления шаблона).
 */
const props = defineProps<{ points: CompanyPoint[]; selectedId: string | null }>();
const emit = defineEmits<{ select: [id: string] }>();

const el = ref<HTMLElement | null>(null);
let L: typeof Leaflet | null = null;
let map: Leaflet.Map | null = null;
let layer: Leaflet.LayerGroup | null = null;
const markers = new Map<string, Leaflet.Marker>();

// Собственная SVG-иконка: стандартные PNG-маркеры Leaflet ломаются при бандлинге.
function icon(lib: typeof Leaflet, active: boolean): Leaflet.DivIcon {
  const size = active ? 40 : 32;
  return lib.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${active ? '#c2410c' : '#ea580c'}" stroke="#fff" stroke-width="1.5"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6" fill="#fff" stroke="none"/></svg>`,
  });
}

const located = computed(() =>
  props.points.filter(
    (p): p is CompanyPoint & { latitude: number; longitude: number } =>
      p.latitude !== null && p.longitude !== null,
  ),
);

function render(): void {
  if (!L || !map || !layer) return;
  layer.clearLayers();
  markers.clear();
  for (const p of located.value) {
    const marker = L.marker([p.latitude, p.longitude], { icon: icon(L, p.id === props.selectedId) })
      .bindTooltip(p.title)
      .on('click', () => emit('select', p.id));
    marker.addTo(layer);
    markers.set(p.id, marker);
  }
  if (located.value.length > 0) {
    const bounds = L.latLngBounds(located.value.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

onMounted(async () => {
  // Leaflet — UMD-пакет: в зависимости от бандлера API лежит в default или в самом модуле.
  const mod = (await import('leaflet')) as typeof Leaflet & { default?: typeof Leaflet };
  L = mod.default ?? mod;
  if (!el.value) return;
  // Центр по умолчанию — Бишкек.
  map = L.map(el.value, { scrollWheelZoom: false }).setView([42.8746, 74.5698], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  layer = L.layerGroup().addTo(map);
  render();
});

watch(() => props.points, render);

watch(
  () => props.selectedId,
  (id, prev) => {
    if (prev && L) markers.get(prev)?.setIcon(icon(L, false));
    const marker = id ? markers.get(id) : undefined;
    if (marker && map && L) {
      marker.setIcon(icon(L, true));
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: 0.6 });
    }
  },
);

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div ref="el" class="isolate h-full w-full" />
</template>
