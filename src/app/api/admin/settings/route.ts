import { NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/data";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateSiteSettings(body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
