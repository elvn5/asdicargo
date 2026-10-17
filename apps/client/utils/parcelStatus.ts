import type { ParcelStatus } from '~/types/api';

type BadgeColor = 'neutral' | 'info' | 'warning' | 'success' | 'error' | 'primary';

interface ParcelStatusMeta {
  icon: string;
  color: BadgeColor;
}

/** Иконка и цвет бейджа для каждого статуса; подписи — в i18n `account.status.*`. */
export const PARCEL_STATUS_META: Record<ParcelStatus, ParcelStatusMeta> = {
  created: { icon: 'i-lucide-file-plus', color: 'neutral' },
  in_transit: { icon: 'i-lucide-truck', color: 'info' },
  arrived: { icon: 'i-lucide-warehouse', color: 'primary' },
  ready_for_pickup: { icon: 'i-lucide-package-check', color: 'warning' },
  issued: { icon: 'i-lucide-circle-check', color: 'success' },
  cancelled: { icon: 'i-lucide-circle-x', color: 'error' },
};

/** Путь посылки по шагам (без «отменена») — для прогресса в карточке. */
export const PARCEL_STATUS_STEPS: ParcelStatus[] = [
  'created',
  'in_transit',
  'arrived',
  'ready_for_pickup',
  'issued',
];

/** Статусы, при которых посылка ещё «в работе». */
export const ACTIVE_PARCEL_STATUSES: ParcelStatus[] = [
  'created',
  'in_transit',
  'arrived',
  'ready_for_pickup',
];
