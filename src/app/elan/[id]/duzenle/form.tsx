"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { ALL_REGIONS_WITH_DIGER } from "@/lib/regions";

type Cat = { id: string; name: string; emoji: string; parentId: string | null };

export default function EditForm({
  listing, categories,
}: {
  listing: {
    id: string; title: string; description: string; price: number;
    condition: string; city: string | null; images: string[];
    categoryId: string | null; type: string;
  };
  categories: Cat[];
}) {
  const r = useRouter();
  const [condition, setCondition] = useState<"NEW" | "LIKE_NEW" | "USED">(listing.condition as any);
  const [images, setImages] = useState<string[]>(listing.images);
  const [loading, setLoading] = useState(false);

  const initialParents = useMemo(() => {
    if (!listing.categoryId) return { parentId: "", childId: "", grandId: "" };
    const cat = categories.find((c) => c.id === listing.categoryId);
    if (!cat) return { parentId: "", childId: "", grandId: "" };
    if (!cat.parentId) return { parentId: cat.id, childId: "", grandId: "" };
    const parent = categories.find((c) => c.id === cat.parentId);
    if (parent && !parent.parentId) return { parentId: parent.id, childId: cat.id, grandId: "" };
    if (parent && parent.parentId) {
      const grand = categories.find((c) => c.id === parent.parentId);
      if (grand) return { parentId: grand.id, childId: parent.id, grandId: cat.id };
    }
    return { parentId: "", childId: "", grandId: "" };
  }, [listing.categoryId, categories]);

  const [parentId, setParentId] = useState(initialParents.parentId);
  const [childId, setChildId] = useState(initialParents.childId);
  const [grandId, setGrandId] = useState(initialParents.grandId);

  const parents = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const children = useMemo(() => categories.filter((c) => c.parentId === parentId), [categories, parentId]);
  const grandchildren = useMemo(() => categories.filter((c) => c.parentId === childId), [categories, childId]);

  const finalCategoryId = grandId || childId || parentId;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      price: Number(fd.get("price")),
      city: fd.get("city") || null,
      categoryId: finalCategoryId || null,
      condition,
      images,
    };
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) { toast.error((await res.json()).error); return; }
    toast.success("Yeniləndi!");
    r.push(`/elan/${listing.id}`);
    r.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Elanı redaktə et</h1>
        <Link href={`/elan/${listing.id}`} className="text-sm text-gray-500 hover:text-orange-600">← Geri</Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
        ℹ️ Elan növü ({listing.type === "AUCTION" ? "Auksion" : "Sabit qiymət"}) dəyişdirilə bilməz
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Şəkillər</label>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <input name="title" required defaultValue={listing.title} placeholder="Başlıq"
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />

      <textarea name="description" required rows={4} defaultValue={listing.description} placeholder="Təsvir"
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" />

      <div className="grid grid-cols-2 gap-3">
        <input name="price" required type="number" step="0.01" defaultValue={listing.price}
          className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        <select name="city" defaultValue={listing.city || ""}
          className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
          <option value="">Şəhər / Rayon seç</option>
          {ALL_REGIONS_WITH_DIGER.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Vəziyyət</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "NEW", l: "🆕 Yeni" },
            { v: "LIKE_NEW", l: "✨ Yeni kimi" },
            { v: "USED", l: "📦 İşlənmiş" },
          ].map((c) => (
            <button key={c.v} type="button" onClick={() => setCondition(c.v as any)}
              className={`p-3 rounded-xl text-sm border-2 transition-all ${
                condition === c.v ? "border-orange-500 bg-orange-50 font-medium" : "border-gray-200 hover:border-orange-300"
              }`}>
              {c.l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Kateqoriya</label>
        <select value={parentId} onChange={(e) => { setParentId(e.target.value); setChildId(""); setGrandId(""); }}
          className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
          <option value="">— Əsas kateqoriya seç —</option>
          {parents.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        {children.length > 0 && (
          <select value={childId} onChange={(e) => { setChildId(e.target.value); setGrandId(""); }}
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">— Alt kateqoriya seç —</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        )}
        {grandchildren.length > 0 && (
          <select value={grandId} onChange={(e) => setGrandId(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">— Model seç —</option>
            {grandchildren.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.98 }} disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:shadow-lg font-bold disabled:opacity-50">
        {loading ? "Yenilənir..." : "Yadda saxla"}
      </motion.button>
    </motion.form>
  );
}