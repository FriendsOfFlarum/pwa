import app from 'flarum/forum/app';

let registrationPromise: Promise<ServiceWorkerRegistration | undefined> | undefined;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;

  const basePath = app.forum.attribute<string>('basePath').replace(/\/$/, '');

  await navigator.serviceWorker.register(`${basePath}/sw`, {
    scope: `${basePath}/`,
  });

  return await navigator.serviceWorker.ready;
}

export function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  registrationPromise ??= registerServiceWorker();

  return registrationPromise;
}
