/**
 * The forum is running as the installed app on iOS (added to the home screen).
 *
 * Its own small module so the forum's main bundle can ask without loading the
 * pull-to-refresh code behind it.
 */
export function isIOSStandalone(): boolean {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  // iPadOS 13+ reports itself as a Mac, but a Mac has no touch points.
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

  return standalone && ios;
}
