import app from 'flarum/forum/app';
import { openDB, type IDBPDatabase } from 'idb';

let dbPromise: Promise<IDBPDatabase> | null = null;
let registrationPromise: Promise<ServiceWorkerRegistration | undefined> | undefined;

const getDB = (): Promise<IDBPDatabase> => {
  dbPromise ??= openDB('keyval-store', 1, {
    upgrade(database) {
      database.createObjectStore('keyval');
    },
  });

  return dbPromise;
};

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;

  const basePath = app.forum.attribute<string>('basePath').replace(/\/$/, '');
  const database = await getDB();
  await database.put('keyval', app.forum.data.attributes, 'flarum.forumPayload');

  await navigator.serviceWorker.register(`${basePath}/sw`, {
    scope: `${basePath}/`,
  });

  return await navigator.serviceWorker.ready;
}

export function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  registrationPromise ??= registerServiceWorker();

  return registrationPromise;
}
