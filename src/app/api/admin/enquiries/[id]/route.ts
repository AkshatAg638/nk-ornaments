import { NextResponse } from "next/server";
import { markEnquiryRead, deleteEnquiry } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { is_read: boolean };
    const updated = await markEnquiryRead(id, body.is_read);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update enquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEnquiry(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete enquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
