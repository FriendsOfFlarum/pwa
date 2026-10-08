import app from 'flarum/forum/app';
import { getServiceWorkerRegistration } from './registerServiceWorker';
import addPushNotifications from './push/addPushNotifications';
import showOptInAlert from './push/showOptInAlert';
import { pushConfigured, supportsWebPush } from './push/utils';
import { syncPushSubscription } from './push/subscription';
import { usingAppleWebview } from './native/appleWebView';
import { isIOSStandalone } from './standalone/isIOSStandalone';

export { default as extend } from './extend';

app.initializers.add('fof-pwa', () => {
  addPushNotifications();

  app.beforeMount(async () => {
    if ('share' in navigator && app.forum.attribute<boolean>('fofPwaShareButtons')) {
      const { default: addShareControls } = await import('./share/addShareControls');
      addShareControls();
    }

    // Only for the installed app on iOS, which has no pull to refresh of its
    // own; everyone else never downloads this.
    if (isIOSStandalone()) {
      const { default: addPullToRefresh } = await import('./standalone/addPullToRefresh');
      addPullToRefresh();
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
