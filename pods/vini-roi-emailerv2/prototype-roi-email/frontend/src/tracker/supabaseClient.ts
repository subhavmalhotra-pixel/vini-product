import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the tracker (read path).
 * Configure via frontend env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * When unset, the tracker falls back to mock data (see dataSource.ts).
 * ⚠️ roi_digest_runs holds dealer PII — gate reads behind Supabase Auth + RLS
 *    in production (see db/SUPABASE-REVIEW.md).
 */
const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, { auth: { persistSession: true } })
  : null;
