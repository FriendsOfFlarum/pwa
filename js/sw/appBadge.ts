declare const self: ServiceWorkerGlobalScope;

/**
 * The unread count on the installed app's icon (Badging API: iOS and iPadOS
 * home screen apps, and installed apps in Chromium browsers and Safari).
 */
export async function setAppBadge(count: unknown): Promise<void> {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 0 || !('setAppBadge' in self.navigator)) {
    return;
  }

  try {
    await (count > 0 ? self.navigator.setAppBadge(count) : self.navigator.clearAppBadge());
  } catch {
    // Not allowed here (no notification permission): the badge is a nicety.
    return;
  }

  // An open forum shows the bell's count on the badge: tell it to put that back.
  for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) {
    client.postMessage({ type: 'fof-pwa:badge' });
  }
}
