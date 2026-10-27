import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/data/config";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (isMockMode()) {
      const { getMockStore } = await import("@/lib/data/mock/store");
      getMockStore().activeRole = "visitor";
      const cookieStore = await cookies();
      cookieStore.set("nk_mock_role", "visitor", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ success: true, message: "Logged out" });
    }

    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: "Logged out" });
  } catch (err: unknown) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
