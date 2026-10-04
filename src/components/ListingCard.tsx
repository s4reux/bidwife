"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useTimeAgo(date: string) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(date).getTime();
      const h = Math.floor(diff / 3600000);
      const d = Math.floor(h / 24);
      const timeStr = new Date(date).toLocaleTimeString("az-AZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (h < 24) setText(`Bu gün, ${timeStr}`);
      else if (d < 7) setText(`${d} gün əvvəl`);
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

export default function ListingCard({ l, idx }: { l: any; idx?: number }) {
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
    toast.success(data.favorited ? "❤️ Favorilərə əlavə edildi" : "Favorilərdən silindi");
  }

  return (
    <Link href={`/elan/${l.id}`} className="block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
        {l.images?.[0] ? (
          <img
            src={
              l.images[0].includes("ik.imagekit.io")
                ? `${l.images[0]}?tr=w-400,h-400,q-80,f-webp`
                : l.images[0]
            }
            alt={l.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-300 text-4xl">📦</div>
        )}

        <button
          type="button"
          onClick={toggleFav}
          disabled={favLoading}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full grid place-items-center transition-all shadow-sm z-20 ${
            favorited ? "bg-white" : "bg-white/85"
          }`}
          style={{ pointerEvents: "auto" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={favorited ? "#ef4444" : "none"}
            stroke={favorited ? "#ef4444" : "#6b7280"}
            strokeWidth="2.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {isVip && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded z-20">
            👑 VIP
          </div>
        )}

        {l.type === "AUCTION" && !ended && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded z-20">
            ● CANLI
          </div>
        )}
        {l.type === "AUCTION" && ended && (
          <div className="absolute top-2 left-2 bg-gray-800/90 text-white text-[9px] font-bold px-2 py-1 rounded z-20">
            Bitdi
          </div>
        )}
      </div>

      <div className="px-0.5">
        <div className="text-[15px] font-black text-gray-900 leading-tight mb-0.5">
          {topBid ?? price} <span className="text-[13px] font-bold">₼</span>
        </div>

        <h3 className="text-[13px] text-gray-800 leading-snug line-clamp-2 mb-1">
          {l.title}
        </h3>

        {l.type === "AUCTION" && !ended && countdown && (
          <div
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 ${
              urgent ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className="w-1 h-1 bg-current rounded-full" />
            {countdown}
          </div>
        )}

        <div className="flex items-center justify-between gap-1 text-[11px] text-gray-400">
          <span className="truncate">
            {l.city || "—"}, {timeAgo}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isVip && <span className="text-amber-500 text-[10px]">👑</span>}
            {l.type === "AUCTION" && <span className="text-red-500 text-[10px]">🔶</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}