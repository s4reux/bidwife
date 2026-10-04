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
      if (res.status === 401) toast.error("Favorilərə əlavə etmək üçün daxil ol");
      else toast.error(data.error || "Xəta");
      return;
    }
    const data = await res.json();
    setFavorited(data.favorited);
    toast.success(data.favorited ? "Favorilərə əlavə edildi" : "Favorilərdən silindi");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.025, 0.25) }}
    >
      <Link
        href={`/elan/${l.id}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full"
      >
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {l.images?.[0] ? (
            <img
              src={l.images[0]}
              alt={l.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-300 text-4xl">📦</div>
          )}

          {/* Ürək */}
          <button
            onClick={toggleFav}
            disabled={favLoading}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur grid place-items-center hover:bg-white transition-all shadow-sm"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={favorited ? "#ef4444" : "none"}
              stroke={favorited ? "#ef4444" : "#9ca3af"}
              strokeWidth="2.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* VIP badge */}
          {isVip && (
            <div className="absolute top-3 left-3 bg-black/85 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>👑</span> VIP
            </div>
          )}

          {/* Auksion badge */}
          {l.type === "AUCTION" && !isVip && (
            <div
              className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                ended
                  ? "bg-gray-900/85 text-white"
                  : "bg-white/95 backdrop-blur text-red-600"
              }`}
            >
              {ended ? "Bitdi" : "● CANLI"}
            </div>
          )}

          {/* Şəkil sayı */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-medium px-2 py-1 rounded-md">
              +{imageCount - 1}
            </div>
          )}
        </div>

        <div className="p-3.5">
          {/* Qiymət */}
          <div className="mb-2">
            <span className="text-xl font-black text-gray-900">
              {topBid ?? price}
            </span>
            <span className="text-sm font-bold text-gray-500 ml-0.5">₼</span>
          </div>

          {/* Başlıq */}
          <h3 className="text-[13.5px] font-medium text-gray-800 line-clamp-2 leading-snug mb-2 min-h-[2.3rem]">
            {l.title}
          </h3>

          {/* Auksion vaxtı */}
          {l.type === "AUCTION" && !ended && countdown && (
            <div
              className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-md mb-2 ${
                urgent ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
              }`}
            >
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              {countdown}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
            <span className="truncate">{l.city || "—"}</span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              {l.views > 0 && <span>👁 {l.views}</span>}
              <span>{timeAgo}</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}