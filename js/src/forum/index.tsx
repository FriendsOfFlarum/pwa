import app from 'flarum/forum/app';
import addShareButtons from './addShareButtons';
import addPushNotifications from './addPushNotifications';
import { registerServiceWorker } from './registerServiceWorker';

app.initializers.add('fof-pwa', () => {
  app.beforeMount(() => {
    registerServiceWorker().catch((e) => console.error('SW registration failed', e));
  });

  addShareButtons();
  addPushNotifications();
});
