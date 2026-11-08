import { syncAppBadge } from './appBadge';

declare const self: ServiceWorkerGlobalScope;

interface PushPayload {
  title: string;
  content?: string;
  icon?: string;
  badge?: string;
  link?: string;
}

// Flarum shows the offline page now, so the copy fof/pwa kept goes.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((cacheName) => cacheName.startsWith('fof-pwa-offline')).map((cacheName) => caches.delete(cacheName)))
      )
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  event.waitUntil(
    (async () => {
      let payload: PushPayload;

      try {
        payload = event.data!.json() as PushPayload;
      } catch (error) {
        console.error('[fof-pwa] Invalid push payload:', error);
        return;
      }

      await self.registration.showNotification(payload.title, {
        body: payload.content,
        icon: payload.icon,
        badge: payload.badge,
        data: {
          link: payload.link,
        },
      });

      // Show the notification before updating the badge in case the update fails.
      await syncAppBadge();
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const link = event.notification.data?.link;

  event.waitUntil(Promise.all([typeof link === 'string' && link ? self.clients.openWindow(link) : null, syncAppBadge()]));
});

self.addEventListener('notificationclose', (event) => {
  event.waitUntil(syncAppBadge());
});
