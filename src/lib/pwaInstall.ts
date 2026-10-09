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
  return (typeof window !== 'undefined' && window.__pwaDeferred) || null;
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

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const evt = getDeferred();
  if (!evt) return 'unavailable';
  try {
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    window.__pwaDeferred = null;
    if (outcome !== 'accepted') markInstallPromptSeen();
    notify();
    return outcome;
  } catch {
    return 'unavailable';
  }
}

export function subscribePwaInstall(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function initPwaInstallListeners() {
  if (typeof window === 'undefined') return;

  // если событие уже поймал inline-скрипт в index.html
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
