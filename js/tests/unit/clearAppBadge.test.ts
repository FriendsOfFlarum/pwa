import { jest } from '@jest/globals';
import clearAppBadge from '../../src/forum/push/clearAppBadge';

const clear = jest.fn(async () => {});
let visibility: DocumentVisibilityState = 'visible';

Object.assign(navigator, { clearAppBadge: clear });
Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });

const changeVisibility = (state: DocumentVisibilityState) => {
  visibility = state;
  document.dispatchEvent(new Event('visibilitychange'));
};

beforeEach(() => clear.mockClear());

test('opening the forum clears the badge, and so does bringing it back to the front', () => {
  clearAppBadge();
  expect(clear).toHaveBeenCalledTimes(1);

  changeVisibility('hidden');
  expect(clear).toHaveBeenCalledTimes(1);

  changeVisibility('visible');
  expect(clear).toHaveBeenCalledTimes(2);
});

test('a forum opened in the background leaves the badge until it is shown', () => {
  visibility = 'hidden';
  clearAppBadge();
  expect(clear).not.toHaveBeenCalled();

  changeVisibility('visible');
  expect(clear).toHaveBeenCalled();
});
