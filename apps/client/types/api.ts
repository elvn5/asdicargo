// Публичный профиль пользователя, возвращаемый API (/account/*).
export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  telegramId: string | null;
  createdAt: string;
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
