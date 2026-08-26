export {};

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'fof-pwa-offline-v1';
const OFFLINE_URL = 'offline';

interface PushPayload {
  title: string;
  content?: string;
  icon?: string;
  badge?: string;
  link?: string;
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('fof-pwa-offline') && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const offlineResponse = await cache.match(OFFLINE_URL);

      return (
        offlineResponse ??
        new Response('You are offline.', {
          status: 503,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      );
    })
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
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const link = event.notification.data?.link;

  if (typeof link !== 'string' || !link) {
    return;
  }

  event.waitUntil(self.clients.openWindow(link));
});
