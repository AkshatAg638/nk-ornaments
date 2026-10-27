import { NextResponse } from "next/server";
import { setMockRole } from "@/lib/data";
import { UserRole } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { role } = (await request.json()) as { role: UserRole };
    if (!["admin", "customer", "visitor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    await setMockRole(role);
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("nk_mock_role", role, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    return NextResponse.json({ success: true, role });
  } catch {
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
