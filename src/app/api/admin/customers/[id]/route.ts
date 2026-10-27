import { NextResponse } from "next/server";
import { updateCustomer } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateCustomer(id, body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update customer";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
