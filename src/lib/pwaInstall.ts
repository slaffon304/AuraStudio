export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

declare global {
  interface Window {
    __pwaDeferred?: BeforeInstallPromptEvent | null;
  }
}

const DISMISS_KEY = 'aurastudio_pwa_prompt_seen';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function getDeferred(): BeforeInstallPromptEvent | null {
  if (typeof window === 'undefined') return null;
  return window.__pwaDeferred || null;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function hasSeenInstallPrompt(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function markInstallPromptSeen() {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function canNativeInstall(): boolean {
  return Boolean(getDeferred()) && !isStandalone();
}

export function shouldShowInstallEntry(): boolean {
  return !isStandalone();
}

/** Только из обработчика клика — сразу, без await перед prompt */
export function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const evt = getDeferred();
  if (!evt) return Promise.resolve('unavailable');

  // prompt() сразу, в том же тике что и клик
  const p = evt.prompt();
  return p
    .then(() => evt.userChoice)
    .then(({ outcome }) => {
      window.__pwaDeferred = null;
      if (outcome !== 'accepted') markInstallPromptSeen();
      notify();
      return outcome;
    })
    .catch(() => 'unavailable' as const);
}

export function subscribePwaInstall(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function initPwaInstallListeners() {
  if (typeof window === 'undefined') return;

  if (window.__pwaDeferred) notify();

  window.addEventListener('pwa-deferred-ready', () => notify());

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaDeferred = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    window.__pwaDeferred = null;
    markInstallPromptSeen();
    notify();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }
}
