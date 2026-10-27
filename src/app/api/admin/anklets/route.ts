import { NextResponse } from "next/server";
import { getAnklets, createAnklet } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;

  const anklets = await getAnklets({
    categoryId,
    search,
    activeOnly: false,
  });
  return NextResponse.json(anklets);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.sku || !body.category_id) {
      return NextResponse.json(
        { error: "Name, SKU, and Category are required." },
        { status: 400 }
      );
    }

    const created = await createAnklet({
      category_id: body.category_id,
      name: body.name,
      sku: body.sku,
      description: body.description || null,
      material: body.material || null,
      weight: body.weight || null,
      length: body.length || null,
      colour: body.colour || null,
      wholesale_price: Number(body.wholesale_price || 0),
      min_order_qty: Number(body.min_order_qty || 1),
      stock_quantity: Number(body.stock_quantity || 0),
      low_stock_threshold: Number(body.low_stock_threshold || 5),
      manual_out_of_stock: Boolean(body.manual_out_of_stock),
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      images: body.images || [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create anklet";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
