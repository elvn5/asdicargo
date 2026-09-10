import { defineStore } from 'pinia';
import { useApiClient } from '~/shared/api/client';
import type { AuthUser, TelegramAuthData } from '~/shared/api/types';

interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    // Была ли уже проверена сессия в текущем окружении (SSR/CSR).
    checked: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => state.user !== null,
    displayName: (state): string => {
      const u = state.user;
      if (!u) return '';
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
      return full || u.username || u.email || 'Аккаунт';
    },
  },
  actions: {
    async register(payload: RegisterPayload): Promise<void> {
      const api = useApiClient();
      this.user = await api.post<AuthUser>('/account/register', payload);
      this.checked = true;
    },
    async login(email: string, password: string): Promise<void> {
      const api = useApiClient();
      this.user = await api.post<AuthUser>('/account/login', { email, password });
      this.checked = true;
    },
    async loginWithTelegram(data: TelegramAuthData): Promise<void> {
      const api = useApiClient();
      this.user = await api.post<AuthUser>('/account/telegram', data);
      this.checked = true;
    },
    async logout(): Promise<void> {
      const api = useApiClient();
      try {
        await api.post('/account/logout');
      } finally {
        this.user = null;
      }
    },
    async fetchMe(force = false): Promise<AuthUser | null> {
      if (this.checked && !force) return this.user;
      // Всё в try/catch, включая инициализацию клиента: проверка сессии не должна
      // ронять SSR-рендер страницы, даже если API недоступен или контекст запроса
      // прочитать не удалось.
      try {
        const api = useApiClient();
        this.user = await api.get<AuthUser>('/account/me');
      } catch {
        this.user = null;
      }
      this.checked = true;
      return this.user;
    },
  },
});
