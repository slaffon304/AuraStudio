export interface SampleUserPhoto {
  id: string;
  name: string;
  url: string;
  gender: 'female' | 'male' | 'neutral';
}

// Crisp, verified high-contrast SVG / Canvas sample portraits for instant 1-click test generation
export const SAMPLE_USER_PORTRAITS: SampleUserPhoto[] = [
  {
    id: 'sample-alexandra',
    name: 'Alexandra (Chișinău)',
    gender: 'female',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232a2438"/><stop offset="100%" stop-color="%2314111d"/></linearGradient><linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f7d1b3"/><stop offset="100%" stop-color="%23e3b08b"/></linearGradient><linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b1704"/><stop offset="100%" stop-color="%23110901"/></linearGradient></defs><rect width="600" height="800" fill="url(%23g1)"/><circle cx="300" cy="330" r="140" fill="url(%23skin)"/><path d="M160 300 C150 160 450 160 440 300 C430 210 390 180 300 180 C210 180 170 210 160 300 Z" fill="url(%23hair)"/><path d="M160 300 C140 450 170 540 190 600 C200 480 200 360 210 320 Z" fill="url(%23hair)"/><path d="M440 300 C460 450 430 540 410 600 C400 480 400 360 390 320 Z" fill="url(%23hair)"/><ellipse cx="255" cy="320" rx="14" ry="9" fill="%232b1704"/><ellipse cx="345" cy="320" rx="14" ry="9" fill="%232b1704"/><path d="M280 380 Q300 395 320 380" stroke="%23c46d50" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M200 520 C200 460 400 460 400 520 L440 800 L160 800 Z" fill="%23373b4d"/><text x="300" y="740" fill="%23a0a6b8" font-family="sans-serif" font-size="20" font-weight="600" text-anchor="middle">Alexandra · Chișinău</text></svg>'
  },
  {
    id: 'sample-mihai',
    name: 'Mihai (București)',
    gender: 'male',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="skinM" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23e8be9b"/><stop offset="100%" stop-color="%23cf9b74"/></linearGradient><linearGradient id="hairM" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23262626"/><stop offset="100%" stop-color="%230a0a0a"/></linearGradient></defs><rect width="600" height="800" fill="url(%23bg)"/><path d="M190 270 C190 170 410 170 410 270 C410 210 370 190 300 190 C230 190 190 210 190 270 Z" fill="url(%23hairM)"/><path d="M200 270 L200 370 Q300 480 400 370 L400 270 Z" fill="url(%23skinM)"/><circle cx="260" cy="315" r="7" fill="%2318181b"/><circle cx="340" cy="315" r="7" fill="%2318181b"/><path d="M245 295 Q260 288 275 295" stroke="%2318181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M325 295 Q340 288 355 295" stroke="%2318181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M280 395 Q300 410 320 395" stroke="%23a8583c" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M170 510 C170 450 430 450 430 510 L480 800 L120 800 Z" fill="%231e2433"/><text x="300" y="740" fill="%2394a3b8" font-family="sans-serif" font-size="20" font-weight="600" text-anchor="middle">Mihai · București</text></svg>'
  },
  {
    id: 'sample-elena',
    name: 'Elena (Iași)',
    gender: 'female',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="bgE" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23382924"/><stop offset="100%" stop-color="%2317100e"/></linearGradient><linearGradient id="skinE" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fed7aa"/><stop offset="100%" stop-color="%23fb923c"/></linearGradient></defs><rect width="600" height="800" fill="url(%23bgE)"/><circle cx="300" cy="330" r="130" fill="url(%23skinE)"/><ellipse cx="260" cy="315" rx="12" ry="8" fill="%233f2e1d"/><ellipse cx="340" cy="315" rx="12" ry="8" fill="%233f2e1d"/><path d="M275 385 Q300 405 325 385" stroke="%23c2410c" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M180 520 C180 460 420 460 420 520 L450 800 L150 800 Z" fill="%232c1b18"/><text x="300" y="740" fill="%23fdba74" font-family="sans-serif" font-size="20" font-weight="600" text-anchor="middle">Elena · Iași</text></svg>'
  }
];
