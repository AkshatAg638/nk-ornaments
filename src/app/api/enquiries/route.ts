import { NextResponse } from "next/server";
import { createEnquiry } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.message) {
      return NextResponse.json(
        { error: "Name and message are required." },
        { status: 400 }
      );
    }
    const enquiry = await createEnquiry({
      name: body.name,
      phone: body.phone,
      email: body.email,
      message: body.message,
    });
    return NextResponse.json(enquiry, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit enquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
