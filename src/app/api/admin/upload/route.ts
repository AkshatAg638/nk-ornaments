import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/data/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sku = (formData.get("sku") as string) || "anklet";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const sanitizedSku = sku.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${Math.floor(Math.random() * 1000)}.webp`;
    const storagePath = `anklets/${sanitizedSku}/${fileName}`;
    const bytes = await file.arrayBuffer();
    const sizeBytes = bytes.byteLength;

    if (isMockMode()) {
      // In mock mode, convert to base64 data URL for instant zero-dependency display
      const base64 = Buffer.from(bytes).toString("base64");
      const dataUrl = `data:image/webp;base64,${base64}`;
      return NextResponse.json({
        public_url: dataUrl,
        storage_path: storagePath,
        size_bytes: sizeBytes,
      });
    }

    // In Supabase mode, upload to real Supabase Storage bucket 'anklet-photos'
    const adminClient = createAdminClient();
    const { error: uploadError } = await adminClient.storage
      .from("anklet-photos")
      .upload(storagePath, Buffer.from(bytes), {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = adminClient.storage
      .from("anklet-photos")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      public_url: publicUrlData.publicUrl,
      storage_path: storagePath,
      size_bytes: sizeBytes,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get("path");

    if (!storagePath) {
      return NextResponse.json(
        { error: "Storage path required" },
        { status: 400 }
      );
    }

    if (!isMockMode()) {
      const adminClient = createAdminClient();
      await adminClient.storage.from("anklet-photos").remove([storagePath]);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
