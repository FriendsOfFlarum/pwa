import app from 'flarum/forum/app';
import { getApplicationServerKey, getVapidPublicKey } from './utils';

export async function syncPushSubscription(registration: ServiceWorkerRegistration): Promise<void> {
  if (!app.session.user) return;

  const applicationServerKey = getVapidPublicKey();
  let subscription = await registration.pushManager.getSubscription();

  if (subscription && getApplicationServerKey(subscription) !== applicationServerKey) {
    if (!(await subscription.unsubscribe())) {
      throw new Error('Could not unsubscribe from the previous VAPID key.');
    }

    subscription = null;
  }

  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await app.request({
    method: 'POST',
    url: `${app.forum.attribute<string>('apiUrl')}/push_subscriptions`,
    body: {
      data: {
        attributes: subscription.toJSON(),
      },
    },
  });
}
