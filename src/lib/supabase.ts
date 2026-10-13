import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zjshigepycaaqbqyuztk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2hpZ2VweWNhYXFicXl1enRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDg1ODUsImV4cCI6MjEwNjc4NDU4NX0.CZvBuz6WuyqpIwGmmlNKrr8OQB5fWQOKFplJ4Q4DxUM';

const rawUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
).trim();

const rawKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY
).trim();

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
    lowerKey.length < 20
  ) {
    return false;
  }

  return true;
};

// Client URL and key
const clientUrl = isSupabaseConfigured() && isValidHttpUrl(rawUrl)
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const clientKey = isSupabaseConfigured()
  ? rawKey
  : DEFAULT_SUPABASE_ANON_KEY;

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
    return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
}

export const supabase: SupabaseClient = initializeSupabaseClient();
