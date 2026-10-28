declare const self: ServiceWorkerGlobalScope;

let pending: Promise<void> = Promise.resolve();

/**
 * iOS and iPadOS home screen apps need an explicit badge update.
 * Android already badges installed apps from their notifications.
 */
export function syncAppBadge(): Promise<void> {
  // Serialize recounts so an older count cannot overwrite a newer one.
  return (pending = pending.then(recount));
}

async function recount(): Promise<void> {
  if (!('setAppBadge' in self.navigator)) {
    return;
  }

  try {
    const count = (await self.registration.getNotifications()).length;

    await (count > 0 ? self.navigator.setAppBadge(count) : self.navigator.clearAppBadge());
  } catch {
    // Ignore badge errors so later recounts can still run.
  }
}
