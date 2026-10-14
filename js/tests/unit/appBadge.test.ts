import { jest } from '@jest/globals';
import app from 'flarum/forum/app';
import NotificationsDropdown from 'flarum/forum/components/NotificationsDropdown';
import syncAppBadge from '../../src/forum/push/syncAppBadge';
import { setAppBadge } from '../../sw/appBadge';

// What the icon's badge was asked to show, page and service worker alike.
const calls: string[] = [];
let bell = 0;

// The page and the worker share one navigator here: the order of the calls is what is under test.
Object.assign(navigator, {
  setAppBadge: jest.fn(async (n: number) => void calls.push(`set ${n}`)),
  clearAppBadge: jest.fn(async () => void calls.push('clear')),
  serviceWorker: new EventTarget(),
});
// The worker's open windows: one, this page, which gets its messages as a browser delivers them (later, not inline).
Object.assign(self, {
  clients: {
    matchAll: async () => [
      { postMessage: (data: unknown) => setTimeout(() => navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data }))) },
    ],
  },
});
(app as any).session = { user: { unreadNotificationCount: () => bell } };

syncAppBadge();

// What the header does on every redraw: its bell's lifecycle hook runs.
const redraw = () =>
  NotificationsDropdown.prototype.onupdate.call(Object.create(NotificationsDropdown.prototype), { dom: document.createElement('div') } as any);
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

beforeEach(async () => {
  // Every test starts from a page that has shown a cleared bell.
  bell = 0;
  redraw();
  await settle();
  calls.length = 0;
});

test('the badge follows the bell, once per change', () => {
  bell = 2;
  redraw();
  redraw();
  bell = 1;
  redraw();

  expect(calls).toEqual(['set 2', 'set 1']);
});

test('a push delayed past "Mark all as read" does not leave its count on the badge while the forum is open', async () => {
  bell = 2;
  redraw();
  bell = 0; // Mark all as read
  redraw();

  await setAppBadge(2); // the delayed push, in the service worker
  await settle();
  redraw();

  expect(calls).toEqual(['set 2', 'clear', 'set 2', 'clear']);
});

test('coming back to the forum puts the bell count back', () => {
  document.dispatchEvent(new Event('visibilitychange'));

  expect(calls).toEqual(['clear']);
});

test('the worker ignores a count that is not a whole number of zero or more, and tells no window', async () => {
  for (const count of [undefined, null, '7', -1, 2.5]) {
    await setAppBadge(count);
  }
  await settle();

  expect(calls).toEqual([]);
});

test('a badge the worker is not allowed to set tells no window', async () => {
  (navigator.setAppBadge as jest.Mock<any>).mockImplementationOnce(async () => {
    throw new Error('NotAllowedError');
  });

  await setAppBadge(3);
  await settle();

  expect(calls).toEqual([]);
});
