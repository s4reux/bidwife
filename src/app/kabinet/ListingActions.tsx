"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ListingActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function del() {
    if (!confirm("Elanı silmək istədiyinə əminsən?")) return;
    setLoading(true);
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { toast.error("Silinmedi"); return; }
    toast.success("Silindi");
    r.refresh();
  }

  return (
    <div className="flex gap-1.5">
      <Link href={`/elan/${id}/duzenle`}
        className="flex-1 text-center text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded-lg font-medium transition-colors">
        ✏️ Redaktə
      </Link>
      <button onClick={del} disabled={loading}
        className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
        {loading ? "..." : "🗑️ Sil"}
      </button>
    </div>
  );
}