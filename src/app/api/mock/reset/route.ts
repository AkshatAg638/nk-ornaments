import { NextResponse } from "next/server";
import { resetMockStore } from "@/lib/data/mock/store";

export async function POST() {
  resetMockStore();
  return NextResponse.json({ success: true, message: "Mock store reset to initial sample data" });
}
