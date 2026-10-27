import { NextResponse } from "next/server";
import { getAnkletById, updateAnklet, deleteAnklet } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const anklet = await getAnkletById(id);
  if (!anklet) {
    return NextResponse.json({ error: "Anklet not found" }, { status: 404 });
  }
  return NextResponse.json(anklet);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateAnklet(id, body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update anklet";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteAnklet(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete anklet";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
