import type {
  AddressKind,
  AppealStatus,
  DocumentRequestStatus,
  NotificationType,
  ShipmentRequestStatus,
} from '~/types/api';

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

/** Бейджи статусов обращений; подписи — в i18n `account.appeals.status.*`. */
export const APPEAL_STATUS_META: Record<AppealStatus, { icon: string; color: BadgeColor }> = {
  open: { icon: 'i-lucide-clock', color: 'warning' },
  answered: { icon: 'i-lucide-message-circle-reply', color: 'success' },
  closed: { icon: 'i-lucide-circle-check', color: 'neutral' },
};

/** Бейджи статусов документов; подписи — в i18n `account.documents.status.*`. */
export const DOCUMENT_STATUS_META: Record<
  DocumentRequestStatus,
  { icon: string; color: BadgeColor }
> = {
  pending: { icon: 'i-lucide-hourglass', color: 'info' },
  ready: { icon: 'i-lucide-file-check', color: 'success' },
  rejected: { icon: 'i-lucide-file-x', color: 'error' },
};

/** Иконки уведомлений по типу. */
export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  parcel_status: 'i-lucide-package',
  request_status: 'i-lucide-clipboard-list',
  request_reply: 'i-lucide-message-square-text',
  appeal_reply: 'i-lucide-message-circle-reply',
  document_ready: 'i-lucide-file-check',
  document_rejected: 'i-lucide-file-x',
};
