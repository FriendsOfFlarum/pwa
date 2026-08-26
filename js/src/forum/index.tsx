import app from 'flarum/forum/app';
import addPushNotifications from './addPushNotifications';
import { registerServiceWorker } from './registerServiceWorker';

app.initializers.add('fof-pwa', () => {
  app.beforeMount(async () => {
    registerServiceWorker().catch((e) => console.error('SW registration failed', e));

    if ('share' in navigator) {
      const { default: addShareControls } = await import('./share/addShareControls');
      addShareControls();
    }
  });

  addPushNotifications();
});
