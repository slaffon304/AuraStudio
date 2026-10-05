import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isServerSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    serviceRoleKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    serviceRoleKey !== 'your-service-role-key-here'
  );
};

const serverUrl = isServerSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const serverKey = isServerSupabaseConfigured() ? serviceRoleKey : 'placeholder-service-key';

export const supabaseAdmin: SupabaseClient = createClient(serverUrl, serverKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  creditBalance: number;
}

/**
 * Extracts and verifies the Supabase Auth JWT token from the Authorization header.
 * Returns the authenticated user profile or null.
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

    // Fetch user profile from database to get real role and credit balance
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
