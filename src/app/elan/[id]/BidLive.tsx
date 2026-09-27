"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/listings/${listingId}/bids`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.bids.length !== bids.length || Number(data.top) !== top) {
          setBids(data.bids);
          setTop(Number(data.top));
          setFlash(true);
          setTimeout(() => setFlash(false), 1500);
        }
      } catch {}
    }

    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [listingId, bids.length, top]);

  return (
    <div>
      <div className={`transition-all ${flash ? "scale-105" : ""}`}>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          Cari təklif
        </div>
        <div className={`text-3xl font-black mb-1 transition-colors ${
          flash ? "text-green-600" : "text-orange-600"
        }`}>
          {top.toFixed(2)} ₼
        </div>
      </div>

      {bids.length > 0 && (
        <ul className="mt-3 space-y-2 max-h-72 overflow-auto">
          <AnimatePresence initial={false}>
            {bids.map((b, i) => (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex justify-between items-center py-2.5 px-3 rounded-xl ${
                  i === 0
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold text-white ${
                    i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gray-400"
                  }`}>
                    {b.userName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">
                    {i === 0 && "👑 "}{b.userName}
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
    </div>
  );
}