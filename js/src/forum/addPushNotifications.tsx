import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import NotificationGrid from 'flarum/forum/components/NotificationGrid';
import SettingsPage from 'flarum/forum/components/SettingsPage';
import Alert from 'flarum/common/components/Alert';
import Button from 'flarum/common/components/Button';
import Link from 'flarum/common/components/Link';
import Page from 'flarum/common/components/Page';
import icon from 'flarum/common/helpers/icon';
import ItemList from 'flarum/common/utils/ItemList';
import { usingAppleWebview, requestPushPermissions, requestPushPermissionState, requestPushToken, usePWABuilder } from './use-pwa-builder';
import type Mithril from 'mithril';
import type { ServiceWorkerWithPush } from './types';

declare global {
  interface Window {
    Notification: NotificationConstructor;
  }

  interface NotificationConstructor {
    permission: NotificationPermission;
    requestPermission(): Promise<NotificationPermission>;
    requestPermission(callback: (permission: NotificationPermission) => void): void;
  }
}

const subscribeUser = async (save: boolean): Promise<void> => {
  if (!app.sw?.pushManager) return;

  const subscription = await app.sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: app.forum.attribute('vapidPublicKey'),
  });

  if (!save) return;

  await app.request({
    method: 'POST',
    url: app.forum.attribute<string>('apiUrl') + '/pwa/push',
    body: { subscription },
  });
};

const pushEnabled = (): boolean => {
  if (!app.session.user) return false;

  const preferences = app.session.user.preferences();

  for (const key in preferences) {
    if (typeof key === 'string' && key.startsWith('notify_') && key.endsWith('_push') && preferences[key]) {
      return true;
    }
  }

  return false;
};

const supportsBrowserNotifications = (): boolean => 'Notification' in window;

export const refreshSubscription = async (sw: ServiceWorkerWithPush): Promise<void> => {
  if (app.cache.pwaRefreshed || !supportsBrowserNotifications() || window.Notification.permission !== 'granted' || !pushEnabled()) {
    app.cache.pwaRefreshed = true;
    return;
  }

  try {
    await subscribeUser(true);
  } catch (e) {
    if (!sw.pushManager) {
      return;
    }

    const subscription = await sw.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      await subscribeUser(true);
    }
  }

  app.cache.pwaRefreshed = true;
};

const pushConfigured = (): boolean => {
  return !!app.forum.attribute('vapidPublicKey');
};

const { registerFirebasePushNotificationListeners, removeFirebasePushNotificationListeners, hasFirebasePushState } = usePWABuilder();

export default function addPushNotifications(): void {
  extend(Page.prototype, 'oncreate', () => {
    if (!pushConfigured()) return;

    const dismissAlert = (): void => {
      localStorage.setItem('askvortsov-pwa.notif-alert.dismissed', JSON.stringify({ timestamp: new Date().getTime() }));
    };

    app.alerts.dismiss(app.cache.pwaNotifsAlert as number);

    if (
      !localStorage.getItem('askvortsov-pwa.notif-alert.dismissed') &&
      supportsBrowserNotifications() &&
      window.Notification.permission === 'default' &&
      pushEnabled()
    ) {
      app.cache.pwaNotifsAlert = app.alerts.show(
        {
          controls: [
            <Link className="Button Button--link" href={app.route('settings')} onclick={() => dismissAlert()}>
              {app.translator.trans('fof-pwa.forum.alerts.optin_button')}
            </Link>,
          ],
          ondismiss: dismissAlert,
        },
        app.translator.trans('fof-pwa.forum.alerts.optin')
      );
    }
  });

  extend(NotificationGrid.prototype, 'notificationMethods', function (items: ItemList<any>) {
    if (!pushConfigured()) return;

    items.add('push', {
      name: 'push',
      icon: 'fas fa-mobile',
      label: app.translator.trans('fof-pwa.forum.settings.push_header'),
    });
  });

  extend(SettingsPage.prototype, 'notificationsItems', function (items: ItemList<Mithril.Children>) {
    if (usingAppleWebview() || !pushConfigured()) return;

    if (!supportsBrowserNotifications()) {
      items.add(
        'push-no-browser-support',
        <Alert
          dismissible={false}
          controls={[
            <a
              className="Button Button--link"
              href="https://developer.mozilla.org/en-US/docs/Web/API/Push_API"
              target="_blank"
              rel="noopener noreferrer"
            >
              {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.no_browser_support_button')}
            </a>,
          ]}
        >
          {icon('fas fa-exclamation-triangle')}
          {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.no_browser_support')}
        </Alert>,
        10
      );
      return;
    }

    if (window.Notification.permission === 'default') {
      items.add(
        'push-optin-default',
        <Alert
          dismissible={false}
          attrs={{ className: 'pwa-setting-alert' }}
          controls={[
            <Button
              className="Button Button--link"
              onclick={() => {
                const requestPermission = window.Notification.requestPermission();

                if (requestPermission instanceof Promise) {
                  requestPermission.then((res) => {
                    m.redraw();
                    if (res === 'granted') {
                      subscribeUser(true);
                    }
                  });
                } else {
                  // Legacy callback API
                  window.Notification.requestPermission((res: NotificationPermission) => {
                    m.redraw();
                    if (res === 'granted') {
                      subscribeUser(true);
                    }
                  });
                }
              }}
            >
              {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button')}
            </Button>,
          ]}
        >
          {icon('fas fa-exclamation-circle')}
          {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default')}
        </Alert>,
        10
      );
    } else if (window.Notification.permission === 'denied') {
      items.add(
        'push-optin-denied',
        <Alert
          type="error"
          dismissible={false}
          attrs={{ className: 'pwa-setting-alert' }}
          controls={[
            <a
              className="Button Button--link"
              href="https://support.humblebundle.com/hc/en-US/articles/360008513933-Enabling-and-Disabling-Browser-Notifications-in-Various-Browsers"
              target="_blank"
              rel="noopener noreferrer"
            >
              {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_denied_button')}
            </a>,
          ]}
        >
          {icon('fas fa-exclamation-triangle')}
          {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_denied')}
        </Alert>,
        10
      );
    }
  });

  extend(SettingsPage.prototype, 'notificationsItems', function (items: ItemList<Mithril.Children>) {
    if (!usingAppleWebview()) return;

    if (!hasFirebasePushState('authorized')) {
      items.add(
        'firebase-push-optin-default',
        <Alert
          dismissible={false}
          attrs={{ className: 'pwa-setting-alert' }}
          controls={[
            <Button className="Button Button--link" onclick={() => requestPushPermissions()}>
              {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button')}
            </Button>,
          ]}
        >
          {icon('fas fa-exclamation-circle')}
          {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default')}
        </Alert>,
        10
      );
    }
  });

  extend(SettingsPage.prototype, 'oncreate', function () {
    registerFirebasePushNotificationListeners();
  });

  extend(SettingsPage.prototype, 'onremove', function () {
    removeFirebasePushNotificationListeners();
  });
}
