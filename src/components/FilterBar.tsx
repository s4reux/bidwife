"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_REGIONS_WITH_DIGER } from "@/lib/regions";

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

  return (
    <>
      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
          <span className="pl-3 md:pl-4 pr-1.5 text-gray-400 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Nə axtarırSan?"
            className="flex-1 min-w-0 py-3.5 pr-1 text-[14px] md:text-[15px] bg-transparent outline-none placeholder-gray-400"
          />
          <button
            onClick={apply}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 md:px-5 py-2.5 m-1 rounded-xl font-medium text-[13px] md:text-[14px] transition-colors shrink-0"
          >
            Axtar
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="relative bg-white border border-gray-200 px-4 rounded-2xl hover:border-orange-500 transition-colors flex items-center gap-2 shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          <span className="hidden md:inline text-sm font-medium text-gray-700">Filtr</span>
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
                  <button onClick={clear} className="text-xs text-red-600 hover:underline">
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
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Şəhər / Rayon
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                >
                  <option value="">Hamısı</option>
                  {ALL_REGIONS_WITH_DIGER.map((c) => (
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
                    { v: "NEW", l: "Yeni" },
                    { v: "LIKE_NEW", l: "Yeni kimi" },
                    { v: "USED", l: "İşlənmiş" },
                  ].map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setCondition(c.v)}
                      className={`p-2 rounded-lg text-xs border transition-all ${
                        condition === c.v
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white border-gray-200 hover:border-orange-300"
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
                    { v: "AUCTION", l: "Auksion" },
                    { v: "FIXED", l: "Sabit" },
                  ].map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setType(c.v)}
                      className={`p-2 rounded-lg text-xs border transition-all ${
                        type === c.v
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white border-gray-200 hover:border-orange-300"
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