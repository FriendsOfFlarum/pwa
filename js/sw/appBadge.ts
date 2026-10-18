declare const self: ServiceWorkerGlobalScope;

let pending: Promise<void> = Promise.resolve();

/**
 * Sets the installed app's icon badge to the number of the forum's notifications
 * still shown, and clears it when there are none (Badging API). Android badges an
 * installed app from its notifications already; iOS and iPadOS home screen apps
 * only show a badge that is set.
 */
export function syncAppBadge(): Promise<void> {
  // One recount at a time, so an earlier count can never overwrite a later one.
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
    // Not allowed here (no notification permission): the badge is a nicety.
  }
}
