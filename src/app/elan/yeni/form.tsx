"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

type Cat = { id: string; name: string; emoji: string; parentId: string | null };

export default function NewListingForm({ categories }: { categories: Cat[] }) {
  const r = useRouter();
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");
  const [condition, setCondition] = useState<"NEW" | "LIKE_NEW" | "USED">("USED");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState("");
  const [childId, setChildId] = useState("");
  const [grandId, setGrandId] = useState("");

  const parents = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const children = useMemo(
    () => categories.filter((c) => c.parentId === parentId),
    [categories, parentId]
  );
  const grandchildren = useMemo(
    () => categories.filter((c) => c.parentId === childId),
    [categories, childId]
  );

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
      type,
      condition,
      auctionEnd: type === "AUCTION" ? fd.get("auctionEnd") : null,
      images,
    };
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error((await res.json()).error);
      return;
    }
    const { id } = await res.json();
    toast.success("Elan yaradıldı!");
    r.push(`/elan/${id}`);
    r.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5 max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold">Yeni elan</h1>

      {/* Elan növü */}
      <div className="grid grid-cols-2 gap-3">
        {(["FIXED", "AUCTION"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              type === t ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="text-2xl mb-1">{t === "FIXED" ? "💰" : "🔴"}</div>
            <div className="font-semibold text-sm">
              {t === "FIXED" ? "Sabit qiymət" : "Auksion"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {t === "FIXED" ? "Birbaşa satış" : "Təkliflə satış"}
            </div>
          </button>
        ))}
      </div>

      {/* Şəkillər */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Şəkillər</label>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {/* Başlıq */}
      <input
        name="title" required placeholder="Başlıq"
        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
      />

      {/* Təsvir */}
      <textarea
        name="description" required rows={4} placeholder="Təsvir"
        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
      />

      {/* Qiymət + Şəhər */}
      <div className="grid grid-cols-2 gap-3">
        <input
          name="price" required type="number" step="0.01"
          placeholder={type === "AUCTION" ? "Başlanğıc qiymət (₼)" : "Qiymət (₼)"}
          className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <select
          name="city"
          className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
        >
          <option value="">Şəhər seç</option>
          {["Bakı", "Sumqayıt", "Gəncə", "Mingəçevir", "Şirvan",
            "Naxçıvan", "Lənkəran", "Yevlax", "Şəki", "Xankəndi",
            "Şuşa", "Quba", "Qusar", "Zaqatala", "Digər"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* VƏZİYYƏT */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Vəziyyət</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "NEW", l: "🆕 Yeni" },
            { v: "LIKE_NEW", l: "✨ Yeni kimi" },
            { v: "USED", l: "📦 İşlənmiş" },
          ].map((c) => (
            <button
              key={c.v}
              type="button"
              onClick={() => setCondition(c.v as any)}
              className={`p-3 rounded-lg text-sm border-2 transition-all ${
                condition === c.v
                  ? "border-orange-500 bg-orange-50 font-medium"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              {c.l}
            </button>
          ))}
        </div>
      </div>

      {/* KATEQORİYA (kaskad) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Kateqoriya</label>

        <select
          value={parentId}
          onChange={(e) => { setParentId(e.target.value); setChildId(""); setGrandId(""); }}
          className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
        >
          <option value="">— Əsas kateqoriya seç —</option>
          {parents.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>

        {children.length > 0 && (
          <select
            value={childId}
            onChange={(e) => { setChildId(e.target.value); setGrandId(""); }}
            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          >
            <option value="">— Alt kateqoriya seç (opsional) —</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        )}

        {grandchildren.length > 0 && (
          <select
            value={grandId}
            onChange={(e) => setGrandId(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          >
            <option value="">— Model seç (opsional) —</option>
            {grandchildren.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Auksion bitmə tarixi */}
      {type === "AUCTION" && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Auksion bitmə tarixi
          </label>
          <input
            name="auctionEnd" required type="datetime-local"
            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
      >
        {loading ? "Göndərilir..." : "Yerləşdir"}
      </motion.button>
    </motion.form>
  );
}