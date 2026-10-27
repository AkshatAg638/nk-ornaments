import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/data/config";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (isMockMode()) {
      const cookieStore = await cookies();
      const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
      cookieStore.set("nk_mock_role", role, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        role,
        message: "Logged in successfully (Mock Mode)",
      });
    }

    // In Supabase mode:
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Logged in successfully",
    });
  } catch (err: unknown) {
    console.error("Login API error:", err);
    const msg = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
