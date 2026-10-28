/**
 * Clears the installed app's icon badge whenever the forum is opened or brought
 * back to the front: the bell shows what is unread from then on. iOS fires no
 * `notificationclose` for a dismissed notification, so the service worker can't
 * recount then, and this is the earliest the badge can be put right.
 */
export default function clearAppBadge(): void;
