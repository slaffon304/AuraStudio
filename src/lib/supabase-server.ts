import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
// Backend strictly uses server-side SUPABASE_SECRET_KEY
const rawSecretKey = (process.env.SUPABASE_SECRET_KEY || '').trim();

export const isValidHttpUrl = (str?: string | null): boolean => {
  if (!str) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isServerSupabaseConfigured = (): boolean => {
  if (!isValidHttpUrl(rawUrl)) return false;
  if (!rawSecretKey) return false;

  const lowerUrl = rawUrl.toLowerCase();
  const lowerKey = rawSecretKey.toLowerCase();

  if (
    lowerUrl.includes('your-project') ||
    lowerUrl.includes('placeholder') ||
    lowerUrl === 'supabase_url' ||
    lowerUrl === 'vite_supabase_url'
  ) {
    return false;
  }

  if (
    lowerKey === 'your-secret-key-here' ||
    lowerKey === 'placeholder-secret-key' ||
    lowerKey === 'supabase_secret_key' ||
    lowerKey === 'supabase_service_role_key' ||
    lowerKey.length < 20
  ) {
    return false;
  }

  return true;
};

// Safe fallback URL and key guaranteed to be valid HTTP/HTTPS
const serverUrl = isServerSupabaseConfigured() && isValidHttpUrl(rawUrl)
  ? rawUrl
  : 'https://placeholder.supabase.co';

const serverKey = isServerSupabaseConfigured()
  ? rawSecretKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

function initializeServerSupabaseClient(): SupabaseClient {
  try {
    return createClient(serverUrl, serverKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (err) {
    console.warn('Server Supabase client initialized in fallback mode:', err);
    return createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
}

export const supabaseAdmin: SupabaseClient = initializeServerSupabaseClient();

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  creditBalance: number;
}

/**
 * Extracts and verifies the Supabase Auth JWT token from the Authorization header.
 * Derives user identity strictly from the verified JWT and PostgreSQL profiles table.
 */
export async function authenticateRequest(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  if (!isServerSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    // Fetch user profile from database to verify role and credit balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, credit_balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        id: user.id,
        email: user.email || '',
        role: 'user',
        creditBalance: 0
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      creditBalance: profile.credit_balance
    };
  } catch (err) {
    console.error('Error authenticating request token:', err);
    return null;
  }
}
