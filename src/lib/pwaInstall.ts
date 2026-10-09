/** PWA install prompt (beforeinstallprompt) */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'aurastudio_pwa_prompt_seen';
const INSTALLED_KEY = 'aurastudio_pwa_installed';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || ios;
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

export function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, '1');
  } catch {
    /* ignore */
  }
  deferredPrompt = null;
  notify();
}

export function canPromptInstall(): boolean {
  return Boolean(deferredPrompt) && !isStandalone();
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  const evt = deferredPrompt;
  try {
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === 'accepted') markInstalled();
    else markInstallPromptSeen();
    deferredPrompt = null;
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

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    markInstalled();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    });
  }
}
