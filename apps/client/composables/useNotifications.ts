import type { AccountNotification } from '~/types/api';

// Как часто обновлять счётчик непрочитанных, пока открыт кабинет.
const POLL_INTERVAL_MS = 60_000;

/**
 * Счётчик непрочитанных уведомлений, общий для меню кабинета и страниц.
 * Опрос запускает оболочка кабинета (startPolling) — один раз на сессию страницы.
 */
export function useNotifications() {
  const api = useApi();
  const { t } = useI18n();
  const unread = useState<number>('account-unread-notifications', () => 0);

  async function refreshUnread(): Promise<void> {
    try {
      const { count } = await api.get<{ count: number }>('/account/notifications/unread-count');
      unread.value = count;
    } catch {
      // Сеть/сессия — не критично для счётчика, попробуем при следующем опросе.
    }
  }

  function startPolling(): void {
    refreshUnread();
    const timer = setInterval(refreshUnread, POLL_INTERVAL_MS);
    onBeforeUnmount(() => clearInterval(timer));
  }

  /** Заголовок и текст уведомления на языке интерфейса — из type и params. */
  function describe(n: AccountNotification): { title: string; body: string } {
    const p = { ...n.params };
    if (n.type === 'parcel_status' && typeof p.status === 'string') {
      p.status = t(`account.status.${p.status}`);
    }
    if (n.type === 'request_status' && typeof p.status === 'string') {
      p.status = t(`account.requests.status.${p.status}`);
    }
    if (typeof p.docType === 'string') {
      p.doc = t(`account.documents.type.${p.docType}`);
    }
    return {
      title: t(`account.notifications.types.${n.type}.title`, p),
      body: t(`account.notifications.types.${n.type}.body`, p),
    };
  }

  return { unread, refreshUnread, startPolling, describe };
}
