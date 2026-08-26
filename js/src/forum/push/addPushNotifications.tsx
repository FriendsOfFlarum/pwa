import type Mithril from 'mithril';
import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Alert from 'flarum/common/components/Alert';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';
import ItemList from 'flarum/common/utils/ItemList';
import { usingAppleWebview } from '../native/appleWebView';
import { getServiceWorkerRegistration } from '../registerServiceWorker';
import { supportsWebPush, pushConfigured } from './utils';
import { syncPushSubscription } from './subscription';

export default function addPushNotifications(): void {
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

    if (!supportsWebPush()) {
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

    if (Notification.permission === 'default') {
      items.add(
        'push-optin-default',
        <Alert
          dismissible={false}
          className="pwa-setting-alert"
          controls={[
            <Button
              className="Button Button--link"
              onclick={async () => {
                try {
                  const permission = await Notification.requestPermission();
                  m.redraw();
                  if (permission !== 'granted') return;

                  const registration = await getServiceWorkerRegistration();
                  if (!registration) return;
                  await syncPushSubscription(registration);
                } catch (error) {
                  console.error('[fof-pwa] Push subscription failed:', error);
                }
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
      return;
    }

    if (Notification.permission === 'denied') {
      items.add(
        'push-optin-denied',
        <Alert
          type="error"
          dismissible={false}
          className="pwa-setting-alert"
          controls={[
            <a
              className="Button Button--link"
              href="https://support.humblebundle.com/hc/en-us/articles/360008513933-Enabling-and-Disabling-Browser-Notifications-in-Various-Browsers"
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
}
