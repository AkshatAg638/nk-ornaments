import { NextResponse } from "next/server";
import { updateQuickStock } from "@/lib/data";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      updates: { id: string; stock_quantity: number; manual_out_of_stock: boolean }[];
    };
    if (!Array.isArray(body.updates)) {
      return NextResponse.json({ error: "Invalid updates payload" }, { status: 400 });
    }

    await updateQuickStock(body.updates);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update stock";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
