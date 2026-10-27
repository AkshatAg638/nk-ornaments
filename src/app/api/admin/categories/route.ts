import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/data";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await createCategory({
      name: body.name,
      slug,
      description: body.description || "",
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
