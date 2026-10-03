"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useTimeAgo(date: string) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(date).getTime();
      const m = Math.floor(diff / 60000);
      const h = Math.floor(m / 60);
      const d = Math.floor(h / 24);
      if (m < 1) setText("indi");
      else if (m < 60) setText(`${m} dəq əvvəl`);
      else if (h < 24) setText(`${h} saat əvvəl`);
      else if (d < 30) setText(`${d} gün əvvəl`);
      else setText(new Date(date).toLocaleDateString("az-AZ"));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [date]);
  return text;
}

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

export default function ListingCard({ l, idx = 0 }: { l: any; idx?: number }) {
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const price = Number(l.price).toLocaleString("az-AZ", { maximumFractionDigits: 0 });
  const topBid = l.bids?.[0]?.amount
    ? Number(l.bids[0].amount).toLocaleString("az-AZ", { maximumFractionDigits: 0 })
    : null;
  const ended = l.auctionEnd ? new Date(l.auctionEnd) < new Date() : false;
  const { text: countdown, urgent } = useCountdown(
    l.type === "AUCTION" && !ended ? l.auctionEnd : null
  );
  const timeAgo = useTimeAgo(l.createdAt);
  const isVip = l.vipUntil && new Date(l.vipUntil) > new Date();
  const imageCount = l.images?.length || 0;

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => {
        if (d.ids?.includes(l.id)) setFavorited(true);
      })
      .catch(() => {});
  }, [l.id]);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: l.id }),
    });
    setFavLoading(false);
    if (!res.ok) {
      const data = await res.json();
      if (res.status === 401) {
        toast.error("Favorilərə əlavə etmək üçün daxil ol");
      } else {
        toast.error(data.error || "Xəta");
      }
      return;
    }
    const data = await res.json();
    setFavorited(data.favorited);
    toast.success(data.favorited ? "❤️ Favorilərə əlavə edildi" : "Favorilərdən silindi");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
    >
      <Link
        href={`/elan/${l.id}`}
        className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-orange-900/20 transition-all duration-300 h-full"
      >
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {l.images?.[0] ? (
            <img
              src={l.images[0]}
              alt={l.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-300 dark:text-gray-700 text-5xl">
              📦
            </div>
          )}

          <button
            onClick={toggleFav}
            disabled={favLoading}
            className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full backdrop-blur grid place-items-center hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm ${
              favorited ? "bg-red-50 dark:bg-red-950" : "bg-white/90 dark:bg-gray-900/90"
            } disabled:opacity-50`}
          >
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill={favorited ? "#ef4444" : "none"}
              stroke={favorited ? "#ef4444" : "currentColor"}
              strokeWidth="2"
              className={favorited ? "" : "text-gray-400 dark:text-gray-500"}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {imageCount > 1 && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              {imageCount}
            </div>
          )}

          {isVip && (
            <div className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              👑 VIP
            </div>
          )}

          {l.type === "AUCTION" && !isVip && (
            <div
              className={`absolute top-2.5 left-2.5 text-[10px] px-2.5 py-1 rounded-full font-bold ${
                ended ? "bg-gray-900/80 text-white" : "bg-red-500/90 text-white animate-pulse"
              }`}
            >
              {ended ? "Bitdi" : "🔴 AUKSION"}
            </div>
          )}
        </div>

        <div className="p-3.5">
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-lg font-black text-gray-900 dark:text-white">{topBid ?? price}</span>
            <span className="text-base font-bold text-gray-700 dark:text-gray-300">₼</span>
          </div>

          <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1.5 min-h-[2.4rem]">
            {l.title}
          </h3>

          {(l.category || l.condition) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
              {[
                l.category?.name,
                l.condition === "NEW" && "Yeni",
                l.condition === "LIKE_NEW" && "Yeni kimi",
              ].filter(Boolean).join(" • ")}
            </div>
          )}

          {l.type === "AUCTION" && !ended && countdown && (
            <div
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md mb-2 ${
                urgent
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
              }`}
            >
              ⏱ {countdown}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-50 dark:border-gray-800">
            <span className="truncate">📍 {l.city || "—"}</span>
            <span className="whitespace-nowrap">{timeAgo}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}