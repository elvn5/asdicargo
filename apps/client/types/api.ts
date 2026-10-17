// Публичный профиль пользователя, возвращаемый API (/account/*).
export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  telegramId: string | null;
  phone: string | null;
  hasPassword: boolean;
  createdAt: string;
}

export type ParcelStatus =
  | 'created'
  | 'in_transit'
  | 'arrived'
  | 'ready_for_pickup'
  | 'issued'
  | 'cancelled';

export interface ParcelStatusHistoryItem {
  id: string;
  status: ParcelStatus;
  createdAt: string;
}

// Посылка пользователя в личном кабинете (/account/parcels).
export interface MyParcel {
  id: string;
  trackNumber: string;
  description: string | null;
  status: ParcelStatus;
  weightKg: string | null;
  volumeM3: string | null;
  costSom: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  history?: ParcelStatusHistoryItem[];
}

export interface ParcelSummary {
  total: number;
  byStatus: Record<ParcelStatus, number>;
}

// Публичные контакты поддержки (/support/public) — карточка менеджера.
export interface PublicSettings {
  consultationUrl: string | null;
  phone: string | null;
  telegramContact: string | null;
  email: string | null;
  workingHours: string | null;
}

// Полезная нагрузка Telegram Login Widget (data-onauth).
export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
