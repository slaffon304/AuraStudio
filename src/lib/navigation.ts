export type AppView =
  | 'landing'
  | 'explore'
  | 'create'
  | 'gallery'
  | 'library'
  | 'admin'
  | 'profile'
  | 'privacy'
  | 'terms'
  | 'offer';

export function viewToPath(view: AppView): string {
  switch (view) {
    case 'landing':
      return '/';
    case 'explore':
    case 'create':
      return '/app';
    case 'profile':
      return '/app/profile';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'offer':
      return '/offer';
    case 'gallery':
      return '/app/gallery';
    case 'library':
      return '/app/library';
    case 'admin':
      return '/app/admin';
    default:
      return '/app';
  }
}

export function pathToView(pathname: string): AppView {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/app/profile') return 'profile';
  if (p === '/privacy') return 'privacy';
  if (p === '/terms') return 'terms';
  if (p === '/offer') return 'offer';
  if (p === '/app/gallery') return 'gallery';
  if (p === '/app/library') return 'library';
  if (p === '/app/admin') return 'admin';
  if (p === '/app' || p.startsWith('/app/')) return 'explore';
  return 'landing';
}

const REDIRECT_KEY = 'aurastudio_after_auth';

export function setAfterAuthRedirect(view: AppView | null) {
  if (view) sessionStorage.setItem(REDIRECT_KEY, view);
  else sessionStorage.removeItem(REDIRECT_KEY);
}

export function consumeAfterAuthRedirect(): AppView | null {
  const v = sessionStorage.getItem(REDIRECT_KEY) as AppView | null;
  sessionStorage.removeItem(REDIRECT_KEY);
  return v;
}
