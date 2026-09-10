import { useRequestHeaders, useRuntimeConfig } from '#imports';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Тонкий клиент к API.
 * - При SSR (внутри Docker) обращается к внутреннему URL API (http://api:3001),
 *   из браузера — к публичному (тот же приём, что и на страницах блога).
 * - При SSR пробрасывает cookie входящего запроса, чтобы /account/me видел сессию.
 * Чтение контекста запроса обёрнуто в try/catch: проверка сессии не должна
 * ронять серверный рендер страницы.
 */
export function useApiClient() {
  const config = useRuntimeConfig();
  const base = (
    import.meta.server ? config.apiInternalUrl : config.public.apiBaseUrl
  ) as string;

  let cookieHeader = '';
  if (import.meta.server) {
    try {
      cookieHeader = useRequestHeaders(['cookie']).cookie ?? '';
    } catch {
      cookieHeader = '';
    }
  }

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };
    if (cookieHeader) {
      headers.cookie = cookieHeader;
    }

    const response = await fetch(`${base}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const body = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new ApiError(body?.message ?? 'Request failed', response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
