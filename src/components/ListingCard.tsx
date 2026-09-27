"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function useCountdown(end?: string | null) {
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    if (!end) return;
    const update = () => {
      const diff = new Date(end).getTime() - Date.now();
      if (diff <= 0) { setText("Bitdi"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setUrgent(diff < 3600000);
      if (d > 0) setText(`${d}g ${h}s`);
      else if (h > 0) setText(`${h}s ${m}d ${s}sn`);
      else setText(`${m}d ${s}sn`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [end]);
  return { text, urgent };
}

const CONDITION_LABEL: Record<string, string> = { NEW: "Yeni", LIKE_NEW: "Yeni kimi", USED: "İşlənmiş" };

export default function ListingCard({ l, idx = 0 }: { l: any; idx?: number }) {
  const price = Number(l.price).toFixed(2);
  const topBid = l.bids?.[0]?.amount ? Number(l.bids[0].amount).toFixed(2) : null;
  const ended = l.auctionEnd ? new Date(l.auctionEnd) < new Date() : false;
  const { text: countdown, urgent } = useCountdown(l.type === "AUCTION" && !ended ? l.auctionEnd : null);
  const isVip = l.vipUntil && new Date(l.vipUntil) > new Date();

  const inner = (
    <Link href={`/elan/${l.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-gray-100 card-hover">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
          {l.images?.[0] ? (
            <img src={l.images[0]} alt={l.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-300 text-5xl">📦</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {l.type === "AUCTION" && (
            <div className={`absolute top-2.5 left-2.5 text-[11px] px-2.5 py-1 rounded-full font-bold backdrop-blur-sm ${
              ended ? "bg-gray-900/80 text-white" : "bg-red-500/90 text-white animate-pulse"
            }`}>
              {ended ? "Bitdi" : "🔴 AUKSION"}
            </div>
          )}

                  {l.condition && l.condition !== "USED" && !isVip && (
            <div className="absolute top-2.5 right-2.5 bg-green-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">
              {CONDITION_LABEL[l.condition]}
            </div>
          )}

          {isVip && (
            <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              👑 VIP
            </div>
          )}
        </div>

        <div className="p-3.5 flex-1 flex flex-col">
          <div className="font-semibold text-[13.5px] leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
            {l.title}
          </div>
          <div className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            <span>📍</span> {l.city || "—"}
          </div>

          <div className="mt-auto pt-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                {topBid ? "Ən yüksək" : "Qiymət"}
              </div>
              <div className="text-orange-600 font-black text-lg leading-tight truncate">
                {topBid ?? price} <span className="text-sm">₼</span>
              </div>
            </div>
            {l.type === "AUCTION" && !ended && countdown && (
              <div className={`text-[10.5px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${
                urgent ? "bg-red-600 text-white animate-pulse" : "bg-red-50 text-red-600 border border-red-100"
              }`}>
                ⏱ {countdown}
              </div>
            )}
            {l.type === "AUCTION" && ended && (
              <div className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">Bitdi</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
      className="relative"
    >
           {inner}
    </motion.div>
  );
}