export function isIOS(): boolean {
  const userAgent = navigator.userAgent;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    // iPad can report itself as Mac
    (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1)
  );
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIOSStandalone(): boolean {
  return isIOS() && isStandalone();
}
