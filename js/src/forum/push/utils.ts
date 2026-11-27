import app from 'flarum/forum/app';

export const supportsWebPush = (): boolean => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

/**
 * Flarum registers the forum's service worker, which runs fof/pwa's push
 * handlers after its own.
 */
export function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return Promise.resolve(undefined);

  return navigator.serviceWorker.ready;
}

export const getVapidPublicKey = (): string => app.forum.attribute<string>('vapidPublicKey');

export function getApplicationServerKey(subscription: PushSubscription): string | undefined {
  const key = subscription.options.applicationServerKey;

  if (!key) return undefined;

  return btoa(String.fromCharCode(...new Uint8Array(key)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const pushConfigured = (): boolean => Boolean(getVapidPublicKey());

export const hasEnabledPushPreference = (): boolean => {
  const preferences = app.session.user?.preferences();

  if (!preferences) return false;

  return Object.entries(preferences).some(([key, enabled]) => key.startsWith('notify_') && key.endsWith('_push') && enabled === true);
};
