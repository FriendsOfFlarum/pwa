import app from 'flarum/forum/app';
import { getVapidPublicKey } from './utils';

export async function syncPushSubscription(registration: ServiceWorkerRegistration): Promise<void> {
  if (!app.session.user) return;

  const existingSubscription = await registration.pushManager.getSubscription();

  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: getVapidPublicKey(),
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
