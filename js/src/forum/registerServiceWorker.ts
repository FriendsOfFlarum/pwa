import app from 'flarum/forum/app';
import { openDB, type IDBPDatabase } from 'idb';
import { refreshSubscription } from './addPushNotifications';
import type { ServiceWorkerWithPush } from './types';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = (): Promise<IDBPDatabase> =>
  (dbPromise ??= openDB('keyval-store', 1, {
    upgrade(db) {
      db.createObjectStore('keyval');
    },
  }));

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const basePath = app.forum.attribute<string>('basePath').replace(/\/$/, '');

  const db = await getDB();
  await db.put('keyval', app.forum.data.attributes, 'flarum.forumPayload');

  const sw = await navigator.serviceWorker.register(`${basePath}/sw`, {
    scope: `${basePath}/`,
  });

  await navigator.serviceWorker.ready;
  app.sw = sw as ServiceWorkerWithPush;
  await refreshSubscription(app.sw);
}
