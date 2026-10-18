// Публичный профиль пользователя, возвращаемый API (/account/*).
export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
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

export type AddressKind = 'warehouse' | 'pickup' | 'office';

// Адрес компании (склад, пункт выдачи, офис) — /addresses/public.
export interface CompanyPoint {
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
}

// Запись адресной книги клиента — /account/addresses.
export interface UserAddress {
  id: string;
  label: string;
  contactName: string;
  phone: string;
  city: string;
  address: string;
  comment: string | null;
  isDefault: boolean;
}

export type UserAddressPayload = Omit<UserAddress, 'id'>;

export type ShipmentDirection = 'kg_ru' | 'ru_kg';

export type ShipmentRequestStatus = 'new' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

// Заявка на перевозку — /account/requests.
export interface ShipmentRequest {
  id: string;
  number: number;
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
  updatedAt: string;
}

export interface ShipmentRequestPayload {
  direction: ShipmentDirection;
  fromCity: string;
  toCity: string;
  cargoDescription: string;
  weightKg: number;
  volumeM3: number | null;
  pickupRequired: boolean;
  pickupAddress: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  comment: string | null;
}

export type AppealCategory = 'damage' | 'loss' | 'delay' | 'payment' | 'other';
export type AppealStatus = 'open' | 'answered' | 'closed';

export interface AppealMessage {
  id: string;
  author: 'client' | 'manager';
  body: string;
  createdAt: string;
}

// Обращение — /account/appeals.
export interface Appeal {
  id: string;
  number: number;
  category: AppealCategory;
  subject: string;
  status: AppealStatus;
  parcelId: string | null;
  parcel: { id: string; trackNumber: string } | null;
  messages?: AppealMessage[];
  lastMessageAt: string;
  createdAt: string;
}

export type DocumentType = 'invoice' | 'reconciliation' | 'other';
export type DocumentRequestStatus = 'pending' | 'ready' | 'rejected';

// Заказ документа — /account/documents.
export interface DocumentRequest {
  id: string;
  number: number;
  type: DocumentType;
  periodFrom: string | null;
  periodTo: string | null;
  comment: string | null;
  status: DocumentRequestStatus;
  managerComment: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
}

export type NotificationType =
  | 'parcel_status'
  | 'request_status'
  | 'request_reply'
  | 'appeal_reply'
  | 'document_ready'
  | 'document_rejected';

// Уведомление в кабинете — /account/notifications.
export interface AccountNotification {
  id: string;
  type: NotificationType;
  params: Record<string, string | number>;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}
