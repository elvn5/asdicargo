export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Тонкий клиент к API. На сервере (SSR) пробрасывает cookie входящего запроса,
 * чтобы /account/me корректно определял сессию при серверном рендеринге.
 */
export function useApiClient() {
  const config = useRuntimeConfig();
  const base = config.public.apiBaseUrl as string;
  const ssrHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {};

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${base}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...ssrHeaders,
        ...options.headers,
      },
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
