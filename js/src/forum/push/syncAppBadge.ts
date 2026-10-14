import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import NotificationsDropdown from 'flarum/forum/components/NotificationsDropdown';

/**
 * Sets the installed app's icon badge to the bell's unread count whenever the
 * forum is opened and whenever that count changes on the page (reading a
 * notification, marking all as read), and takes it away for a guest. While
 * the app is closed, a push sets it (see the service worker); while it is open,
 * the bell's count wins.
 */
export default function syncAppBadge() {
  if (!('setAppBadge' in navigator)) {
    return;
  }

  let shown: number | null = null;

  const sync = (count: number) => {
    if (count === shown) {
      return;
    }

    shown = count;

    try {
      (count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge()).catch(() => {});
    } catch {
      // A badge is a nicety: never let it break the header.
    }
  };

  // The bell is drawn for a signed-in user on every redraw, so its count is read once it is on the page.
  const read = () => sync(app.session?.user?.unreadNotificationCount() ?? 0);
  extend(NotificationsDropdown.prototype, 'oncreate', read);
  extend(NotificationsDropdown.prototype, 'onupdate', read);

  // A push sets the badge from the service worker, which may differ from the bell
  // (a push delayed past "Mark all as read"), so the bell's count is set again.
  const reset = () => {
    shown = null;
    read();
  };
  navigator.serviceWorker?.addEventListener('message', (event) => event.data?.type === 'fof-pwa:badge' && reset());
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && reset());

  app.beforeMount(() => {
    if (!app.session.user) {
      sync(0);
    }
  });
}
