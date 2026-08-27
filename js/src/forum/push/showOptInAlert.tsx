import app from 'flarum/forum/app';
import Button from 'flarum/common/components/Button';
import { getServiceWorkerRegistration } from '../registerServiceWorker';
import { syncPushSubscription } from './subscription';
import { hasEnabledPushPreference, pushConfigured, supportsWebPush } from './utils';
import LinkButton from 'flarum/common/components/LinkButton';

const OPT_IN_DISMISSED_KEY = 'fof-pwa.notif-alert.dismissed';

function rememberDismissal(): void {
  localStorage.setItem(OPT_IN_DISMISSED_KEY, JSON.stringify({ timestamp: Date.now() }));
}

function hasDismissedOptIn(): boolean {
  return localStorage.getItem(OPT_IN_DISMISSED_KEY) !== null;
}

export default function showOptInAlert() {
  if (!supportsWebPush() || !pushConfigured() || Notification.permission !== 'default' || !hasEnabledPushPreference() || hasDismissedOptIn()) {
    return;
  }

  let alertId: number;

  alertId = app.alerts.show(
    {
      controls: [
        <Button
          className="Button Button--link"
          onclick={async () => {
            app.alerts.dismiss(alertId);

            try {
              const permission = await Notification.requestPermission();

              if (permission === 'granted') {
                const registration = await getServiceWorkerRegistration();
                if (!registration) return;

                await syncPushSubscription(registration);
                app.alerts.show({ type: 'success' }, app.translator.trans('fof-pwa.forum.alerts.optin_success'));
                return;
              }

              if (permission === 'denied') {
                app.alerts.show(
                  {
                    type: 'error',
                    controls: [
                      <LinkButton href={app.route('fof-pwa.notifications-help')}>
                        {app.translator.trans('fof-pwa.forum.settings.pwa_notifications.access_denied_button')}
                      </LinkButton>,
                    ],
                  },
                  app.translator.trans('fof-pwa.forum.alerts.optin_declined')
                );
                return;
              }

              app.alerts.show({}, app.translator.trans('fof-pwa.forum.alerts.optin_deferred'));
            } catch (error) {
              console.error('[fof-pwa] Push permission request failed:', error);
            }
          }}
        >
          {app.translator.trans('fof-pwa.forum.alerts.optin_enable_button')}
        </Button>,
      ],
      ondismiss: rememberDismissal,
    },
    app.translator.trans('fof-pwa.forum.alerts.optin')
  );
}
