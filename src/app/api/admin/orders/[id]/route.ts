import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/data";
import { OrderStatus } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status: OrderStatus; note?: string };
    const updated = await updateOrderStatus(id, body.status, body.note);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update order status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
