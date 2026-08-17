import { openDB } from 'idb';

export {};
declare const self: ServiceWorkerGlobalScope;

const dbPromise = openDB('keyval-store', 1, {
  upgrade(db) {
    db.createObjectStore('keyval');
  },
});

const idbKeyval = {
  async get(key: IDBValidKey) {
    return (await dbPromise).get('keyval', key);
  },
  async set(key: IDBValidKey, val: unknown) {
    return (await dbPromise).put('keyval', val, key);
  },
  async delete(key: IDBValidKey) {
    return (await dbPromise).delete('keyval', key);
  },
  async clear() {
    return (await dbPromise).clear('keyval');
  },
  async keys() {
    return (await dbPromise).getAllKeys('keyval');
  },
};

const CACHE = 'pwa-page';

const forumPayload: {
  debug?: boolean;
  clockworkEnabled?: boolean;
} = {};

// Replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline";
const offlineFallbackPage = 'offline';

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener('install', function (event) {
  console.log('[PWA] Install event processing...');

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log('[PWA] Cached offline page during install.');

      return cache.add(offlineFallbackPage);
    })
  );

  const receiveInfo = async () => {
    const payload = await idbKeyval.get('flarum.forumPayload');
    if (payload && typeof payload === 'object') {
      Object.assign(forumPayload, payload);
    }
  };

  receiveInfo();
});

// If any fetch fails, it will show the offline page.
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .match(event.request)
      .then((res) => {
        if (event.request.method !== 'GET' || (forumPayload.debug && forumPayload.clockworkEnabled) || !res) {
          return fetch(event.request);
        }

        return res;
      })
      .catch((error) => {
        // The following validates that the request was for a navigation to a new document
        if (event.request.destination !== 'document' || event.request.mode !== 'navigate') {
          throw error;
        }

        return caches.open(CACHE).then(function (cache) {
          return cache.match(offlineFallbackPage).then(function (response) {
            if (!response) {
              throw error;
            }

            return response;
          });
        });
      })
  );
});

// This is an event that can be fired from your page to tell the SW to update the offline page
self.addEventListener('refreshOffline', function () {
  const offlinePageRequest = new Request(offlineFallbackPage);

  return fetch(offlineFallbackPage).then(function (response) {
    return caches.open(CACHE).then(function (cache) {
      console.log('[PWA] Offline page updated from refreshOffline event: ' + response.url);
      return cache.put(offlinePageRequest, response);
    });
  });
});

self.addEventListener('push', function (event) {
  function isJSON(str: string): boolean {
    try {
      return Boolean(JSON.parse(str) && str);
    } catch {
      return false;
    }
  }

  const data = event.data;

  if (data && isJSON(data.text())) {
    const payload = data.json();

    console.log(payload);

    const options = {
      body: payload.content,
      icon: payload.icon,
      badge: payload.badge,
      data: {
        link: payload.link,
      },
    };

    const promiseChain = self.registration.showNotification(payload.title, options);

    event.waitUntil(promiseChain);
  } else {
    console.log('This push event has no data.');
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.link) {
    event.waitUntil(self.clients.openWindow(event.notification.data.link));
  }
});
