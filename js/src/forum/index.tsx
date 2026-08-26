import app from 'flarum/forum/app';
import { getServiceWorkerRegistration } from './registerServiceWorker';
import addPushNotifications from './push/addPushNotifications';
import showOptInAlert from './push/showOptInAlert';
import { pushConfigured, supportsWebPush } from './push/utils';
import { syncPushSubscription } from './push/subscription';
import { usingAppleWebview } from './native/appleWebView';

app.initializers.add('fof-pwa', () => {
  addPushNotifications();

  app.beforeMount(async () => {
    if ('share' in navigator) {
      const { default: addShareControls } = await import('./share/addShareControls');
      addShareControls();
    }

    if (usingAppleWebview()) {
      const { default: addFirebasePushNotifications } = await import('./native/addFirebasePushNotifications');
      addFirebasePushNotifications();
    }

    showOptInAlert();

    void getServiceWorkerRegistration()
      .then((registration) => {
        if (!registration || !supportsWebPush() || !pushConfigured() || Notification.permission !== 'granted') {
          return;
        }

        return syncPushSubscription(registration);
      })
      .catch((error) => {
        console.error('[fof-pwa] SW initialization failed:', error);
      });
  });
});
