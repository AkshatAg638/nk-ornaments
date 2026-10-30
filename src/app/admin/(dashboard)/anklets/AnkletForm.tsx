"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnkletWithImages, Category } from "@/lib/types";

interface AnkletFormProps {
  categories: Category[];
  initialData?: AnkletWithImages | null;
}

interface ImageUploadItem {
  id: string;
  public_url: string;
  storage_path: string;
  size_bytes: number;
  is_primary: boolean;
}

export default function AnkletForm({
  categories,
  initialData,
}: AnkletFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form Fields
  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || categories[0]?.id || ""
  );
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [material, setMaterial] = useState(
    initialData?.material || "German Silver"
  );
  const [weight, setWeight] = useState(initialData?.weight || "45g / pair");
  const [length, setLength] = useState(initialData?.length || "26.0 cm");
  const [colour, setColour] = useState(
    initialData?.colour || "German Silver Polish"
  );
  const [wholesalePrice, setWholesalePrice] = useState(
    initialData?.wholesale_price ? String(initialData.wholesale_price) : "2500"
  );
  const [minOrderQty, setMinOrderQty] = useState(
    initialData?.min_order_qty ? String(initialData.min_order_qty) : "1"
  );
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stock_quantity !== undefined
      ? String(initialData.stock_quantity)
      : "15"
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialData?.low_stock_threshold !== undefined
      ? String(initialData.low_stock_threshold)
      : "5"
  );
  const [manualOutOfStock, setManualOutOfStock] = useState(
    Boolean(initialData?.manual_out_of_stock)
  );
  const [isActive, setIsActive] = useState(
    initialData?.is_active !== undefined ? initialData.is_active : true
  );

  // Images state (max 4)
  const [images, setImages] = useState<ImageUploadItem[]>(
    initialData?.images?.map((img, idx) => ({
      id: img.id || `img-${idx}`,
      public_url: img.public_url,
      storage_path: img.storage_path,
      size_bytes: img.size_bytes || 140000,
      is_primary: img.is_primary ?? idx === 0,
    })) || []
  );

  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side Image compression to WebP (max 1200px width, ~100-200 KB)
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 4) {
      alert("Maximum 4 images allowed per anklet (Free tier storage limit).");
      return;
    }

    setCompressing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check max input file size (5 MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 5 MB maximum input size limit.`);
        continue;
      }

      try {
        const compressed = await compressImageToWebP(file);

        // Upload compressed WebP to storage endpoint
        const blob = await (await fetch(compressed.dataUrl)).blob();
        const uploadForm = new FormData();
        uploadForm.append("file", blob, "image.webp");
        uploadForm.append("sku", sku || "anklet");

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to upload to storage");
        }

        const uploadedData = await uploadRes.json();

        setImages((prev) => {
          if (prev.length >= 4) return prev;
          const isFirst = prev.length === 0;
          return [
            ...prev,
            {
              id: `upload-${Date.now()}-${i}`,
              public_url: uploadedData.public_url || compressed.dataUrl,
              storage_path: uploadedData.storage_path,
              size_bytes: uploadedData.size_bytes || compressed.sizeBytes,
              is_primary: isFirst,
            },
          ];
        });
      } catch (err: unknown) {
        console.error("Upload error:", err);
        const msg = err instanceof Error ? err.message : "Failed to upload image";
        alert(`Error uploading ${file.name}: ${msg}`);
      }
    }

    setCompressing(false);
    e.target.value = ""; // reset input
  }

  // HTML5 Canvas WebP compression helper
  function compressImageToWebP(
    file: File
  ): Promise<{ dataUrl: string; sizeBytes: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context failed"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL("image/webp", 0.85);
          // Estimate byte size from base64 string
          const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(",") + 1);
          const sizeBytes = Math.round((base64Length * 3) / 4);

          resolve({ dataUrl: webpDataUrl, sizeBytes });
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  }

  function setPrimaryImage(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  }

  function removeImage(index: number) {
    const toRemove = images[index];
    if (toRemove && toRemove.storage_path) {
      fetch(
        `/api/admin/upload?path=${encodeURIComponent(toRemove.storage_path)}`,
        { method: "DELETE" }
      ).catch((err) =>
        console.warn("Storage deletion error on remove:", err)
      );
    }

    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Ensure at least one is primary if any exist
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        category_id: categoryId,
        sku: sku.trim().toUpperCase(),
        description,
        material,
        weight,
        length,
        colour,
        wholesale_price: Number(wholesalePrice) || 0,
        min_order_qty: Number(minOrderQty) || 1,
        stock_quantity: Number(stockQuantity) || 0,
        low_stock_threshold: Number(lowStockThreshold) || 5,
        manual_out_of_stock: manualOutOfStock,
        is_active: isActive,
        images: images.map((img, idx) => ({
          storage_path: img.storage_path,
          public_url: img.public_url,
          size_bytes: img.size_bytes,
          is_primary: img.is_primary,
          sort_order: idx,
        })),
      };

      const url = isEditing
        ? `/api/admin/anklets/${initialData!.id}`
        : "/api/admin/anklets";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save anklet");

      router.push("/admin/anklets");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save anklet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/anklets"
            className="text-xs text-text-secondary hover:text-text-primary transition flex items-center gap-1 mb-2"
          >
            &larr; Back to Anklets List
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-light">
            {isEditing ? `Edit Anklet: ${initialData?.name}` : "Add New Wholesale Anklet"}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Fill in specifications, upload WebP compressed photos, and configure order limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/anklets"
            className="btn btn-outline text-xs py-2 px-3.5"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || compressing}
            className="btn btn-primary text-xs py-2 px-5 font-medium shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Anklet" : "Publish Anklet"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-status-out-of-stock-bg border border-status-out-of-stock-border rounded-xl p-4 text-xs text-status-out-of-stock flex items-start gap-2">
          <span className="font-semibold text-status-out-of-stock">Error:</span> {error}
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card-pearl bg-surface-card border-divider p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary border-b border-divider pb-3">
              Basic Product Information
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Anklet Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Rajwada Kundan Pearl Heavy Bridal Payal"
                className="input-pearl w-full text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-pearl w-full text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Product SKU * (Unique)
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g. NK-BR-109"
                  className="input-pearl w-full text-xs font-mono uppercase text-accent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Handcrafted details, bell chimes, finish, and festival/bridal appeal..."
                className="input-pearl w-full text-xs"
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="card-pearl bg-surface-card border-divider p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary border-b border-divider pb-3">
              Jewellery Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Material (Alloy)
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. German Silver, Antique Oxidised White Metal"
                  className="input-pearl w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  ⚖️ Weight (Grams / Pair) *
                </label>
                <input
                  type="text"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 45g, 65g, 85g / pair"
                  className="input-pearl w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Length
                </label>
                <input
                  type="text"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 26.5 cm (10.4 inches)"
                  className="input-pearl w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Colour / Polish
                </label>
                <input
                  type="text"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="e.g. High Polish Silver, Oxidised Charcoal"
                  className="input-pearl w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Multiple Image Upload Pipeline */}
          <div className="card-pearl bg-surface-card border-divider p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Product Photos (Max 4 Images)
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Browser automatically compresses files to WebP (max 1200px) to save Supabase free tier storage.
                </p>
              </div>
              <span className="text-xs font-mono text-accent font-medium">
                {images.length} / 4 Uploaded
              </span>
            </div>

            {/* Photo Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className={`relative rounded-xl overflow-hidden border p-1 bg-bg-alt group ${
                    img.is_primary
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-divider"
                  }`}
                >
                  <img
                    src={img.public_url}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-28 object-cover rounded-lg"
                  />

                  {/* Primary Badge */}
                  {img.is_primary && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-accent text-white font-bold text-[9px] shadow-sm">
                      PRIMARY
                    </span>
                  )}

                  {/* Size chip */}
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-surface-card/90 text-text-secondary border border-divider font-mono text-[9px] backdrop-blur-sm">
                    {(img.size_bytes / 1024).toFixed(0)} KB WebP
                  </span>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-surface-elevated/85 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 p-2">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="w-full py-1 rounded bg-accent/20 text-text-primary hover:bg-accent hover:text-white font-medium text-[10px] transition"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="w-full py-1 rounded bg-rose-500/20 text-rose-700 hover:bg-rose-600 hover:text-white font-medium text-[10px] transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Drop Button */}
              {images.length < 4 && (
                <label className="border-2 border-dashed border-divider hover:border-accent rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition bg-bg-alt/50 hover:bg-bg-alt h-28 text-center">
                  <svg
                    className="w-6 h-6 text-text-secondary mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <span className="text-[11px] font-medium text-text-primary">
                    Add Photo
                  </span>
                  <span className="text-[9px] text-text-secondary">
                    JPG/PNG/WEBP (&le; 5 MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={compressing}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {compressing && (
              <p className="text-xs text-accent animate-pulse font-medium">
                Compressing images in browser to WebP format...
              </p>
            )}
          </div>
        </div>

        {/* Pricing & Stock Column (1 col) */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="card-pearl bg-surface-card border-divider p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary border-b border-divider pb-3">
              Wholesale Pricing
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Wholesale Price (₹ INR / pair) *
              </label>
              <input
                type="number"
                min="0"
                step="5"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="2500"
                className="input-pearl w-full text-xs font-medium text-text-primary"
              />
              <span className="text-[10px] text-text-secondary mt-1 block">
                Wholesale rate shown to authorized buyers. No minimum order quantity restrictions required.
              </span>
            </div>
          </div>

          {/* Stock Logic Card */}
          <div className="card-pearl bg-surface-card border-divider p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary border-b border-divider pb-3">
              Inventory &amp; Stock Status
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Stock Quantity (Pairs)
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="15"
                className="input-pearl w-full text-xs"
              />
              <span className="text-[10px] text-text-secondary mt-1 block">
                Automatically Out of Stock when &le; 0.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Low-Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="5"
                className="input-pearl w-full text-xs"
              />
              <span className="text-[10px] text-text-secondary mt-1 block">
                Shows "Low Stock" badge when at or below this value.
              </span>
            </div>

            <div className="pt-2 border-t border-divider space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualOutOfStock}
                  onChange={(e) => setManualOutOfStock(e.target.checked)}
                  className="rounded text-accent focus:ring-accent h-4 w-4 bg-bg-primary border-divider"
                />
                <div>
                  <span className="text-xs font-medium text-text-primary block">
                    Manual Out of Stock
                  </span>
                  <span className="text-[10px] text-text-secondary block">
                    Override stock and mark as unavailable immediately.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-accent focus:ring-accent h-4 w-4 bg-bg-primary border-divider"
                />
                <div>
                  <span className="text-xs font-medium text-text-primary block">
                    Product Visible on Website
                  </span>
                  <span className="text-[10px] text-text-secondary block">
                    Uncheck to temporarily hide from public view.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
