import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Frontend strictly uses VITE_SUPABASE_PUBLISHABLE_KEY
const rawKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const isValidHttpUrl = (str?: string | null): boolean => {
  if (!str) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = (): boolean => {
  if (!isValidHttpUrl(rawUrl)) return false;
  if (!rawKey) return false;

  const lowerUrl = rawUrl.toLowerCase();
  const lowerKey = rawKey.toLowerCase();

  if (
    lowerUrl.includes('your-project') ||
    lowerUrl.includes('placeholder') ||
    lowerUrl === 'supabase_url' ||
    lowerUrl === 'vite_supabase_url'
  ) {
    return false;
  }

  if (
    lowerKey === 'your-publishable-key-here' ||
    lowerKey === 'placeholder-publishable-key' ||
    lowerKey === 'supabase_publishable_key' ||
    lowerKey === 'vite_supabase_publishable_key' ||
    lowerKey === 'supabase_secret_key' ||
    lowerKey.length < 20
  ) {
    return false;
  }

  return true;
};

// Safe fallback URL and key guaranteed to be valid HTTP/HTTPS
const clientUrl = isSupabaseConfigured() && isValidHttpUrl(rawUrl)
  ? rawUrl
  : 'https://placeholder.supabase.co';

const clientKey = isSupabaseConfigured()
  ? rawKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

function initializeSupabaseClient(): SupabaseClient {
  try {
    return createClient(clientUrl, clientKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Supabase client initialized in fallback mode:', err);
    return createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
}

export const supabase: SupabaseClient = initializeSupabaseClient();
