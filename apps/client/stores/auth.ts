import { defineStore } from 'pinia';
import type { AuthUser } from '~/types/api';

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    // Была ли уже проверена сессия в текущем окружении.
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
      this.user = await useApi().post<AuthUser>('/account/register', payload);
      this.checked = true;
    },
    async login(email: string, password: string): Promise<void> {
      this.user = await useApi().post<AuthUser>('/account/login', { email, password });
      this.checked = true;
    },
    async updateProfile(payload: ProfilePayload): Promise<void> {
      this.user = await useApi().put<AuthUser>('/account/profile', payload);
    },
    async changePassword(newPassword: string, currentPassword?: string): Promise<void> {
      await useApi().post('/account/password', { newPassword, currentPassword });
      if (this.user) this.user.hasPassword = true;
    },
    async logout(): Promise<void> {
      try {
        await useApi().post('/account/logout');
      } finally {
        this.user = null;
      }
    },
    async fetchMe(force = false): Promise<AuthUser | null> {
      if (this.checked && !force) return this.user;
      try {
        this.user = await useApi().get<AuthUser>('/account/me');
      } catch {
        this.user = null;
      }
      this.checked = true;
      return this.user;
    },
  },
});
