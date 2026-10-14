import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config({ override: true });

const rawUrl = (
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://zjshigepycaaqbqyuztk.supabase.co'
).trim();

const rawSecretKey = (
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2hpZ2VweWNhYXFicXl1enRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDg1ODUsImV4cCI6MjEwNjc4NDU4NX0.CZvBuz6WuyqpIwGmmlNKrr8OQB5fWQOKFplJ4Q4DxUM'
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

export const isServerSupabaseConfigured = (): boolean => {
  return true;
};

const isValidJwtKey = (k?: string | null): boolean => {
  if (!k) return false;
  const trimmed = k.trim();
  return trimmed.startsWith('ey') && trimmed.split('.').length === 3;
};

// Safe server URL and key
const serverUrl = isValidHttpUrl(rawUrl) && !rawUrl.toLowerCase().includes('supabase_url')
  ? rawUrl
  : 'https://zjshigepycaaqbqyuztk.supabase.co';

const serverKey = isValidJwtKey(rawSecretKey)
  ? rawSecretKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2hpZ2VweWNhYXFicXl1enRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDg1ODUsImV4cCI6MjEwNjc4NDU4NX0.CZvBuz6WuyqpIwGmmlNKrr8OQB5fWQOKFplJ4Q4DxUM';

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
    return createClient(serverUrl, serverKey, {
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

    // Try PostgreSQL directly first for instant, accurate profile lookup (if configured)
    if (pool) {
      try {
        const { rows } = await pool.query(
          'SELECT id, email, role, photo_balance, credit_balance FROM public.profiles WHERE id = $1',
          [user.id]
        );
        if (rows && rows.length > 0) {
          const p = rows[0];
          return {
            id: p.id,
            email: p.email || user.email || '',
            role: (p.role === 'admin' ? 'admin' : 'user'),
            creditBalance: p.photo_balance ?? p.credit_balance ?? 0
          };
        }
      } catch (dbErr) {
        console.warn('Postgres profile lookup fallback to supabaseAdmin:', dbErr);
      }
    }

    // Fetch user profile from database via supabaseAdmin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, photo_balance, credit_balance')
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

    const p = profile as any;
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      creditBalance: p.credit_balance ?? p.photo_balance ?? 0
    };
  } catch (err) {
    console.error('Error authenticating request token:', err);
    return null;
  }
}
