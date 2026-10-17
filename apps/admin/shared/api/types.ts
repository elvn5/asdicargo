export interface BannedItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export type AddressKind = 'warehouse' | 'pickup' | 'office';

export const ADDRESS_KIND_OPTIONS: { value: AddressKind; label: string }[] = [
  { value: 'pickup', label: 'Пункт выдачи' },
  { value: 'warehouse', label: 'Склад' },
  { value: 'office', label: 'Офис' },
];

export interface Address {
  id: string;
  title: string;
  kind: AddressKind;
  city: string | null;
  fullAddress: string;
  phone: string | null;
  workingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  comment: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface SupportInfo {
  id: string;
  message: string;
  phone: string | null;
  telegramContact: string | null;
  email: string | null;
  workingHours: string | null;
  consultationUrl: string | null;
}

export interface HomeStat {
  id: string;
  language: 'ru' | 'ky' | 'en';
  position: number;
  value: string;
  label: string;
}

export enum ParcelStatus {
  CREATED = 'created',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  READY_FOR_PICKUP = 'ready_for_pickup',
  ISSUED = 'issued',
  CANCELLED = 'cancelled',
}

export const PARCEL_STATUS_OPTIONS: { value: ParcelStatus; label: string }[] = [
  { value: ParcelStatus.CREATED, label: 'Оформлена' },
  { value: ParcelStatus.IN_TRANSIT, label: 'В пути' },
  { value: ParcelStatus.ARRIVED, label: 'Прибыла на склад' },
  { value: ParcelStatus.READY_FOR_PICKUP, label: 'Готова к выдаче' },
  { value: ParcelStatus.ISSUED, label: 'Выдана' },
  { value: ParcelStatus.CANCELLED, label: 'Отменена' },
];

export interface AppUser {
  id: string;
  telegramId: string | null;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
}

export interface Parcel {
  id: string;
  userId: string;
  user?: AppUser;
  trackNumber: string;
  description: string | null;
  status: ParcelStatus;
  weightKg: string | null;
  volumeM3: string | null;
  costSom: string | null;
  comment: string | null;
  createdAt: string;
  history?: ParcelStatusHistoryItem[];
}

export interface ParcelStatusHistoryItem {
  id: string;
  status: ParcelStatus;
  createdAt: string;
}

export type PostLanguage = 'ru' | 'ky' | 'en';
export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  language: PostLanguage;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const POST_LANGUAGE_OPTIONS: { value: PostLanguage; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'ky', label: 'Кыргызча' },
  { value: 'en', label: 'English' },
];

export const POST_STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'published', label: 'Опубликован' },
];

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  language: 'ru' | 'ky' | 'en';
  createdAt: string;
  updatedAt: string;
}

export type ShipmentDirection = 'kg_ru' | 'ru_kg';
export type ShipmentRequestStatus = 'new' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export const SHIPMENT_DIRECTION_LABELS: Record<ShipmentDirection, string> = {
  kg_ru: 'Кыргызстан → Россия',
  ru_kg: 'Россия → Кыргызстан',
};

export const REQUEST_STATUS_OPTIONS: {
  value: ShipmentRequestStatus;
  label: string;
  color: 'info' | 'warning' | 'success' | 'error' | 'neutral';
}[] = [
  { value: 'new', label: 'Новая', color: 'info' },
  { value: 'in_progress', label: 'В работе', color: 'warning' },
  { value: 'completed', label: 'Выполнена', color: 'success' },
  { value: 'rejected', label: 'Отклонена', color: 'error' },
  { value: 'cancelled', label: 'Отменена клиентом', color: 'neutral' },
];

export interface ShipmentRequest {
  id: string;
  number: number;
  userId: string;
  user?: AppUser;
  direction: ShipmentDirection;
  fromCity: string;
  toCity: string;
  cargoDescription: string;
  weightKg: string;
  volumeM3: string | null;
  estimatedCostSom: number;
  pickupRequired: boolean;
  pickupAddress: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  comment: string | null;
  status: ShipmentRequestStatus;
  managerComment: string | null;
  parcelId: string | null;
  createdAt: string;
}
