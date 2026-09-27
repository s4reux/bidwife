"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Category = { id: string; name: string; slug: string; emoji: string };

export default function FilterBar({ categories }: { categories: Category[] }) {
  const r = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState(sp.get("q") || "");
  const [cat, setCat] = useState(sp.get("cat") || "");
  const [city, setCity] = useState(sp.get("city") || "");
  const [condition, setCondition] = useState(sp.get("condition") || "");
  const [type, setType] = useState(sp.get("type") || "");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") || "");

  const activeCount = [cat, city, condition, type, minPrice, maxPrice].filter(Boolean).length;

  function apply() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("cat", cat);
    if (city) params.set("city", city);
    if (condition) params.set("condition", condition);
    if (type) params.set("type", type);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    r.push("/?" + params.toString());
    setOpen(false);
  }

  function clear() {
    setCat(""); setCity(""); setCondition(""); setType("");
    setMinPrice(""); setMaxPrice("");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    r.push("/?" + params.toString());
    setOpen(false);
  }

  const CITIES = [
    "Bakı", "Sumqayıt", "Gəncə", "Mingəçevir", "Şirvan",
    "Naxçıvan", "Lənkəran", "Yevlax", "Şəki", "Xankəndi",
    "Şuşa", "Quba", "Qusar", "Zaqatala", "Digər",
  ];

  return (
    <>
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Nə axtarırSan?"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
          />
        </div>

        <button
          onClick={apply}
          className="bg-orange-600 text-white px-5 rounded-xl hover:bg-orange-700 transition-colors font-medium"
        >
          Axtar
        </button>

        <button
          onClick={() => setOpen(true)}
          className="relative bg-white border border-gray-200 px-4 rounded-xl hover:border-orange-500 transition-colors flex items-center gap-2"
        >
          <span>⚙️</span>
          <span className="hidden md:inline text-sm font-medium">Filtr</span>
          {activeCount > 0 && (
            <span className="bg-orange-600 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-20 overflow-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Filtrlər</h3>
                {activeCount > 0 && (
                  <button
                    onClick={clear}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Təmizlə
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Kateqoriya
                </label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  <option value="">Hamısı</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Şəhər
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  <option value="">Hamısı</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Vəziyyət
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "", l: "Hamısı" },
                    { v: "NEW", l: "🆕 Yeni" },
                    { v: "LIKE_NEW", l: "✨ Yeni kimi" },
                    { v: "USED", l: "📦 İşlənmiş" },
                  ].map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setCondition(c.v)}
                      className={`p-2 rounded-lg text-xs border transition-all ${
                        condition === c.v
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white hover:border-orange-300"
                      }`}
                    >
                      {c.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Elan növü
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "", l: "Hamısı" },
                    { v: "AUCTION", l: "🔴 Auksion" },
                    { v: "FIXED", l: "💰 Sabit" },
                  ].map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setType(c.v)}
                      className={`p-2 rounded-lg text-xs border transition-all ${
                        type === c.v
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white hover:border-orange-300"
                      }`}
                    >
                      {c.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Qiymət aralığı (₼)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200"
                >
                  Bağla
                </button>
                <button
                  onClick={apply}
                  className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700"
                >
                  Tətbiq et
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}