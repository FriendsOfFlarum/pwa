import app from 'flarum/forum/app';
import { getApplicationServerKey, getVapidPublicKey } from './utils';

export async function syncPushSubscription(registration: ServiceWorkerRegistration): Promise<void> {
  if (!app.session.user) return;

  const applicationServerKey = getVapidPublicKey();
  let existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription && getApplicationServerKey(existingSubscription) !== applicationServerKey) {
    if (!(await existingSubscription.unsubscribe())) {
      throw new Error('Could not unsubscribe from the previous VAPID key.');
    }

    existingSubscription = null;
  }

  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }));

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
