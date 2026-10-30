"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category, AnkletWithImages } from "@/lib/types";

interface CategoriesClientProps {
  initialCategories: Category[];
  anklets: AnkletWithImages[];
}

export default function CategoriesClient({
  initialCategories,
  anklets,
}: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Count anklets per category
  function getCount(catId: string) {
    return anklets.filter((a) => a.category_id === catId).length;
  }

  function openAddModal() {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setError(null);
    setModalOpen(true);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (editingCategory) {
        // Edit existing
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category");
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? data : c))
        );
      } else {
        // Create new
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create category");
        setCategories((prev) => [...prev, data]);
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(cat: Category) {
    const count = getCount(cat.id);
    if (count > 0) {
      alert(
        `Cannot delete "${cat.name}": There are currently ${count} anklets assigned to it. Reassign or delete those anklets first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Organize wholesale anklet catalog sections. Categories cannot be deleted while containing products.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories by name or slug..."
          className="input-pearl text-xs"
        />
      </div>

      {/* Categories Table */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-divider text-text-secondary font-mono">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Category Name</th>
                <th className="py-3.5 px-4">URL Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Anklets Count</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-text-secondary">
                    No categories found. Click "Add New Category" above to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const count = getCount(cat.id);
                  return (
                    <tr key={cat.id} className="hover:bg-bg-alt/30 transition">
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-text-primary">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-accent">
                        /{cat.slug}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary max-w-xs truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-bg-alt text-text-secondary border border-divider">
                          {count} designs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn btn-secondary text-xs py-1 px-2.5 border border-divider"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="px-2.5 py-1 rounded-lg bg-status-out-of-stock-bg hover:bg-status-out-of-stock/20 text-status-out-of-stock-text border border-status-out-of-stock/30 transition text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-pearl bg-surface-card border border-divider rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="text-lg font-serif font-medium text-text-primary mb-1">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Categories group anklets for wholesale browsing on the varieties page.
            </p>

            {error && (
              <div className="mb-4 bg-status-out-of-stock-bg border border-status-out-of-stock/25 rounded-xl p-3 text-xs text-status-out-of-stock-text">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Traditional Mathura Ghungroo Payal"
                  className="input-pearl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  URL Slug * (auto-generated)
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. traditional-mathura-ghungroo-payal"
                  className="input-pearl text-xs font-mono text-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this anklet line..."
                  className="input-pearl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs py-2 px-5 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
