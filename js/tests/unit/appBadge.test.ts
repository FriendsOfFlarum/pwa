import { jest, beforeAll, beforeEach, test, expect } from '@jest/globals';
import { syncAppBadge } from '../../sw/appBadge';

const calls: string[] = [];
let shown: Notification[] = [];

const openWindow = jest.fn(async () => null);
const getNotifications = jest.fn(async () => [...shown]);
const setAppBadge = jest.fn(async (n: number) => void calls.push(`set ${n}`));
const clearAppBadge = jest.fn(async () => void calls.push('clear'));

Object.assign(navigator, { setAppBadge, clearAppBadge });
Object.assign(self, {
  clients: { openWindow },
  registration: {
    showNotification: async (title: string, options: NotificationOptions) => {
      const notification = {
        title,
        data: options.data,
        close: () => void (shown = shown.filter((n) => n !== notification)),
      } as unknown as Notification;
      shown.push(notification);
      calls.push(`show ${title}`);
    },
    getNotifications,
  },
});

async function dispatch(type: string, props: object) {
  const waits: Promise<unknown>[] = [];
  self.dispatchEvent(Object.assign(new Event(type), props, { waitUntil: (p: Promise<unknown>) => waits.push(p) }));
  await Promise.all(waits);
}

const push = (title: string, link?: string) => dispatch('push', { data: { json: () => ({ title, link }) } });
const click = (notification: Notification) => dispatch('notificationclick', { notification });
// The browser removes dismissed notifications before firing notificationclose.
const dismiss = (notification: Notification) => {
  notification.close();
  return dispatch('notificationclose', { notification });
};

beforeAll(async () => {
  await import('../../sw/sw');
});

beforeEach(() => {
  calls.length = 0;
  shown = [];
  getNotifications.mockClear();
  openWindow.mockClear();
});

test('each push shows its notification, then the badge counts the ones shown', async () => {
  await push('a');
  await push('b');
  await push('c');

  expect(calls).toEqual(['show a', 'set 1', 'show b', 'set 2', 'show c', 'set 3']);
});

test('clicking a notification opens it and takes it off the badge', async () => {
  await push('a', 'https://forum.test/d/1');
  await push('b');
  calls.length = 0;

  const clicked = click(shown[0]);

  // openWindow must run during the click handler to avoid popup blocking.
  expect(openWindow).toHaveBeenCalledWith('https://forum.test/d/1');
  await clicked;
  expect(calls).toEqual(['set 1']);
});

test('clicking a notification without a link still takes it off the badge', async () => {
  await push('a');
  calls.length = 0;

  await click(shown[0]);

  expect(openWindow).not.toHaveBeenCalled();
  expect(calls).toEqual(['clear']);
});

test('dismissing notifications counts the badge down, and clears it at none', async () => {
  await push('a');
  await push('b');
  calls.length = 0;

  await dismiss(shown[0]);
  await dismiss(shown[0]);

  expect(calls).toEqual(['set 1', 'clear']);
});

test('a recount that answers late cannot overwrite a later one', async () => {
  await push('a');
  calls.length = 0;
  const notifications = [...shown];
  let finishRecount!: (notifications: Notification[]) => void;
  getNotifications.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishRecount = resolve;
      })
  );

  const first = syncAppBadge();
  // Let the first recount reach getNotifications before queuing another push.
  await Promise.resolve();
  const second = push('b');
  await Promise.resolve();
  finishRecount(notifications);
  await Promise.all([first, second]);

  expect(calls).toEqual(['show b', 'set 1', 'set 2']);
});

test('a badge the worker may not set does not stop the notification, or the next badge', async () => {
  setAppBadge.mockRejectedValueOnce(new Error('NotAllowedError'));

  await push('a');
  await push('b');

  expect(calls).toEqual(['show a', 'show b', 'set 2']);
});

test('without the Badging API, notifications are shown and nothing else happens', async () => {
  const optionalNavigator: Partial<Navigator> = navigator;
  delete optionalNavigator.setAppBadge;
  delete optionalNavigator.clearAppBadge;

  try {
    await push('a');
    await dismiss(shown[0]);
  } finally {
    Object.assign(navigator, { setAppBadge, clearAppBadge });
  }

  expect(calls).toEqual(['show a']);
});
