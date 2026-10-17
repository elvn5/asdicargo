import type { AddressKind, ShipmentRequestStatus } from '~/types/api';

type BadgeColor = 'neutral' | 'info' | 'warning' | 'success' | 'error' | 'primary';

/** Иконка и цвет бейджа статуса заявки; подписи — в i18n `account.requests.status.*`. */
export const REQUEST_STATUS_META: Record<
  ShipmentRequestStatus,
  { icon: string; color: BadgeColor }
> = {
  new: { icon: 'i-lucide-clock', color: 'info' },
  in_progress: { icon: 'i-lucide-loader', color: 'warning' },
  completed: { icon: 'i-lucide-circle-check', color: 'success' },
  rejected: { icon: 'i-lucide-circle-x', color: 'error' },
  cancelled: { icon: 'i-lucide-ban', color: 'neutral' },
};

/** Иконки типов точек компании. */
export const POINT_KIND_ICON: Record<AddressKind, string> = {
  warehouse: 'i-lucide-warehouse',
  pickup: 'i-lucide-package-check',
  office: 'i-lucide-building-2',
};

/** Ссылка «маршрут» — на Яндекс.Картах по координатам или по адресу. */
export function pointMapUrl(point: {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  fullAddress: string;
}): string {
  if (point.latitude !== null && point.longitude !== null) {
    return `https://yandex.ru/maps/?pt=${point.longitude},${point.latitude}&z=16&l=map`;
  }
  const text = [point.city, point.fullAddress].filter(Boolean).join(', ');
  return `https://yandex.ru/maps/?text=${encodeURIComponent(text)}`;
}
