/**
 * Supabase Admin Client (server-only)
 *
 * Uses the service-role key to bypass RLS.
 * NEVER import this file from any Client Component or expose its
 * results directly to the browser.
 *
 * Typical use cases:
 *  - First-time admin setup
 *  - Background jobs / cron-triggered API routes
 *  - Operations that need to bypass RLS (e.g. inserting into admins table)
 */

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
