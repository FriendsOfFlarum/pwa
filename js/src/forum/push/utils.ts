import app from 'flarum/forum/app';

export const supportsWebPush = (): boolean => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

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
