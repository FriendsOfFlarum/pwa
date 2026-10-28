/**
 * iOS does not fire `notificationclose` on dismissal, leaving the badge stale.
 * Clear it when the forum becomes visible, since the worker cannot detect dismissal.
 * See https://github.com/FriendsOfFlarum/pwa/pull/34#issuecomment-6481424552.
 */
export default function clearAppBadge(): void;
