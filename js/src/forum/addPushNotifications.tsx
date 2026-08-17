import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Alert from 'flarum/common/components/Alert';
import Button from 'flarum/common/components/Button';
import Link from 'flarum/common/components/Link';
import Page from 'flarum/common/components/Page';
import Icon from 'flarum/common/components/Icon';
import ItemList from 'flarum/common/utils/ItemList';
import { usingAppleWebview, requestPushPermissions, usePWABuilder } from './use-pwa-builder';
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
    applicationServerKey: app.forum.attribute<string>('vapidPublicKey'),
  });

  if (!save) return;

  await app.request({
    method: 'POST',
    url: `${app.forum.attribute<string>('apiUrl')}/push_subscriptions`,
    body: { data: { attributes: subscription.toJSON() } },
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
      localStorage.setItem('fof-pwa.notif-alert.dismissed', JSON.stringify({ timestamp: new Date().getTime() }));
    };

    app.alerts.dismiss(app.cache.pwaNotifsAlert as number);

    if (
      !localStorage.getItem('fof-pwa.notif-alert.dismissed') &&
      supportsBrowserNotifications() &&
      window.Notification.permission === 'default' &&
      pushEnabled()
    ) {
      app.cache.pwaNotifsAlert = app.alerts.show(
        {
          controls: [
            <Link className="Button Button--link" href={app.route('settings')} onclick={dismissAlert}>
              {app.translator.trans('fof-pwa.forum.alerts.optin_button')}
            </Link>,
          ],
          // @ts-ignore - `ondismiss` is not working here because of bug in Flarum core
          onremove: dismissAlert,
        },
        app.translator.trans('fof-pwa.forum.alerts.optin')
      );
    }
  });

  extend('flarum/forum/components/NotificationGrid', 'notificationMethods', function (items: ItemList<any>) {
    if (!pushConfigured()) return;

    items.add('push', {
      name: 'push',
      icon: 'fas fa-mobile',
      label: app.translator.trans('fof-pwa.forum.settings.push_header'),
    });
  });

  extend('flarum/forum/components/SettingsPage', 'notificationsItems', function (items: ItemList<Mithril.Children>) {
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
          <Icon name="fas fa-exclamation-triangle" />
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
          className="pwa-setting-alert"
          controls={[
            <Button
              className="Button Button--link"
              onclick={async () => {
                const result = await window.Notification.requestPermission();
                m.redraw();
                if (result === 'granted') await subscribeUser(true);
              }}
            >
              {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button')}
            </Button>,
          ]}
        >
          <Icon name="fas fa-exclamation-circle" />
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
          className="pwa-setting-alert"
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
          <Icon name="fas fa-exclamation-triangle" />
          {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_denied')}
        </Alert>,
        10
      );
    }
  });

  extend('flarum/forum/components/SettingsPage', 'notificationsItems', function (items: ItemList<Mithril.Children>) {
    if (!usingAppleWebview()) return;

    if (!hasFirebasePushState('authorized')) {
      items.add(
        'firebase-push-optin-default',
        <Alert
          dismissible={false}
          className="pwa-setting-alert"
          controls={[
            <Button className="Button Button--link" onclick={() => requestPushPermissions()}>
              {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default_button')}
            </Button>,
          ]}
        >
          <Icon name="fas fa-exclamation-circle" />
          {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_default')}
        </Alert>,
        10
      );
    }
  });

  extend('flarum/forum/components/SettingsPage', 'oncreate', function () {
    registerFirebasePushNotificationListeners();
  });

  extend('flarum/forum/components/SettingsPage', 'onremove', function () {
    removeFirebasePushNotificationListeners();
  });
}
