"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BidItem = {
  id: string;
  amount: number;
  userName: string;
  createdAt: string;
};

export default function BidLive({
  listingId,
  initialBids,
  initialTop,
}: {
  listingId: string;
  initialBids: BidItem[];
  initialTop: number;
}) {
  const [bids, setBids] = useState<BidItem[]>(initialBids);
  const [top, setTop] = useState(initialTop);
  const [flash, setFlash] = useState(false);
  const lastTopRef = useRef(initialTop);

  // 🔑 Props dəyişdikdə state-i sinxronlaşdır
  useEffect(() => {
    setBids(initialBids);
    setTop(initialTop);
    lastTopRef.current = initialTop;
  }, [initialBids, initialTop]);

  // Polling — hər 2 saniyədə serverdən yoxla
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/listings/${listingId}/bids`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const newTop = Number(data.top);
        const topChanged = newTop !== lastTopRef.current;

        setBids(data.bids);
        setTop(newTop);

        if (topChanged && newTop > lastTopRef.current) {
          // Yeni bid gəldi
          lastTopRef.current = newTop;
          setFlash(true);
          setTimeout(() => setFlash(false), 1500);
        } else {
          lastTopRef.current = newTop;
        }
      } catch {}
    }

    load();
    const t = setInterval(load, 2000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [listingId]);

  return (
    <div>
      <div className={`transition-all duration-300 ${flash ? "scale-105" : ""}`}>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-2">
          Cari təklif
          {flash && <span className="text-green-600 text-[10px] font-bold">YENİ!</span>}
        </div>
        <div
          className={`text-3xl font-black mb-1 transition-colors duration-300 ${
            flash ? "text-green-600" : "text-orange-600"
          }`}
        >
          {top.toFixed(2)} ₼
        </div>
      </div>

      {bids.length > 0 && (
        <ul className="mt-3 space-y-2 max-h-72 overflow-auto">
          <AnimatePresence initial={false}>
            {bids.map((b, i) => (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, x: -20, backgroundColor: "#dcfce7" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex justify-between items-center py-2.5 px-3 rounded-xl ${
                  i === 0
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold text-white ${
                      i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gray-400"
                    }`}
                  >
                    {b.userName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">
                    {i === 0 && "👑 "}
                    {b.userName}
                  </span>
                </div>
                <span className={`font-bold ${i === 0 ? "text-orange-600" : "text-gray-700"}`}>
                  {b.amount.toFixed(2)} ₼
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {bids.length === 0 && (
        <p className="text-sm text-gray-400 mt-3 text-center py-4">
          Hələ təklif yoxdur. İlk təklifi sən ver!
        </p>
      )}
    </div>
  );
}