/**
 * Health-check API route.
 *
 * Returns { status: "ok", timestamp } after a trivial Supabase query.
 * Used by the GitHub Actions cron job (every 3 days) to keep the
 * free-tier Supabase project from pausing due to inactivity.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic"; // never cache

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("site_settings")
      .select("key")
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      { status: "error", message: "Database unreachable" },
      { status: 503 }
    );
  }
}
