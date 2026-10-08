import app from 'flarum/forum/app';

/**
 * Pull to refresh for the installed app on iOS.
 *
 * iOS turns off Safari's own pull-to-refresh in standalone (home-screen) mode,
 * which leaves an installed forum with no way to reload short of closing it.
 * Android keeps its native gesture, so this only runs on iOS standalone:
 * isIOSStandalone() decides whether this module is loaded at all.
 *
 * A pull counts only when it starts with the page at the very top, outside an
 * inner scrolling area, and never while the composer or a modal is open — a
 * reload there would throw away what someone is writing.
 */

/** How far (px, after resistance) a pull must travel before release reloads. */
const THRESHOLD = 80;

/** How far the indicator travels before it stops following the finger. */
const MAX_PULL = 120;

/** Makes the pull feel springy rather than 1:1 with the finger. */
const RESISTANCE = 2.5;

let startY = 0;
let distance = 0;
let eligible = false;
let pulling = false;
let refreshing = false;
let indicator: HTMLElement | null = null;

export default function addPullToRefresh(): void {
  indicator = document.createElement('div');
  indicator.className = 'PWA-ptr';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.innerHTML = '<div class="PWA-ptr-spinner"></div>';
  document.body.appendChild(indicator);

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  document.addEventListener('touchcancel', reset, { passive: true });
}

/** Some themes put overflow on body, and then window.scrollY stays 0 while the page scrolls. */
function scrollTop(): number {
  return Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
}

/** Inside something that scrolls on its own (a chat stream, a long dropdown)? */
function insideScroller(target: EventTarget | null): boolean {
  for (let el = target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
    const overflowY = window.getComputedStyle(el).overflowY;

    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return true;
    }
  }

  return false;
}

/** Someone is writing or looking at something that a reload would close. */
function busy(): boolean {
  return Boolean(app.composer?.isVisible()) || Boolean(app.modal?.isModalOpen());
}

function onTouchStart(e: TouchEvent): void {
  eligible = false;
  pulling = false;
  distance = 0;

  if (refreshing || e.touches.length !== 1 || scrollTop() > 0 || busy() || insideScroller(e.target)) return;

  startY = e.touches[0].clientY;
  eligible = true;
}

function onTouchMove(e: TouchEvent): void {
  if (!eligible || refreshing) return;

  const delta = e.touches[0].clientY - startY;

  if (scrollTop() > 0 || delta <= 0) {
    // Scrolled, or moving up: not a pull (any longer).
    if (pulling) reset();
    if (scrollTop() > 0) eligible = false;
    return;
  }

  pulling = true;
  distance = delta;

  // Only now, with a real pull from the top in progress, take over the gesture.
  e.preventDefault();

  show(distance / RESISTANCE / THRESHOLD);
}

function onTouchEnd(): void {
  if (!pulling) return;

  if (distance / RESISTANCE >= THRESHOLD) {
    refreshing = true;
    indicator?.classList.add('is-refreshing');
    place(THRESHOLD, 1);
    window.setTimeout(() => window.location.reload(), 300);
  } else {
    reset();
  }

  pulling = false;
  eligible = false;
  distance = 0;
}

function show(progress: number): void {
  place(Math.min(distance / RESISTANCE, MAX_PULL), Math.min(progress, 1));
  indicator?.classList.toggle('is-ready', progress >= 1);
}

function place(y: number, opacity: number): void {
  if (!indicator) return;

  // translateX(-50%) is what centres it: setting transform replaces the whole
  // value, so it has to be repeated here alongside the pull distance.
  indicator.style.transform = `translateX(-50%) translateY(${y}px)`;
  indicator.style.opacity = String(opacity);
}

function reset(): void {
  pulling = false;

  if (!indicator) return;

  indicator.classList.remove('is-ready', 'is-refreshing');
  indicator.style.transform = '';
  indicator.style.opacity = '0';
}
