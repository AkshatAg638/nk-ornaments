/**
 * Supabase Browser Client
 *
 * Use this in Client Components (anything with "use client").
 * It uses the public anon key and respects RLS automatically.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
