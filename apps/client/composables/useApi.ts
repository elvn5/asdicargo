/**
 * HTTP-клиент к бэкенду. Живёт в composables/ (контекст приложения), а не в
 * shared/ — в Nuxt 4 shared/ бандлится и в Nitro, где недоступны приложенческие
 * композаблы. Ошибки нормализуются в ApiError со статусом.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export function useApi() {
  const config = useRuntimeConfig();
  // На сервере (если вдруг вызовут) — внутренний URL, из браузера — публичный.
  const baseURL = (
    import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl
  ) as string;

  async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL,
        method: options.method ?? 'GET',
        body: options.body as Record<string, unknown> | undefined,
        // Куки сессии (user_token) — cross-origin на api-сабдомен, same-site.
        credentials: 'include',
      });
    } catch (error) {
      const err = error as {
        statusCode?: number;
        status?: number;
        data?: { message?: string };
        message?: string;
      };
      const status = err.statusCode ?? err.status ?? 500;
      const message = err.data?.message ?? err.message ?? 'Request failed';
      throw new ApiError(message, status);
    }
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
