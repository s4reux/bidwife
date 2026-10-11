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
      if (res.status === 401) toast.error("Daxil ol");
      return;
    }
    const data = await res.json();
    setFavorited(data.favorited);
  }

  return (
    <Link href={`/elan/${l.id}`} className="block group">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1.5">
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
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-300 text-3xl">📷</div>
        )}

        <button
          type="button"
          onClick={toggleFav}
          disabled={favLoading}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 grid place-items-center shadow-sm z-10"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill={favorited ? "#dc2626" : "none"}
            stroke={favorited ? "#dc2626" : "#666"}
            strokeWidth="2.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {isVip && (
          <div className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            VIP
          </div>
        )}
        {l.type === "AUCTION" && !ended && (
          <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            AUKSION
          </div>
        )}
      </div>

      <div>
        <div className="text-[15px] font-bold text-gray-900 leading-tight">
          {topBid ?? price} ₼
        </div>

        <h3 className="text-[13px] text-gray-700 leading-snug line-clamp-2 mt-0.5 min-h-[2.2rem]">
          {l.title}
        </h3>

        {l.type === "AUCTION" && !ended && countdown && (
          <div className={`text-[10px] font-semibold mt-1 ${urgent ? "text-red-600" : "text-gray-500"}`}>
            ⏱ {countdown}
          </div>
        )}

        <div className="text-[11px] text-gray-400 mt-1">
          {l.city || "—"} • {timeAgo}
        </div>
      </div>
    </Link>
  );
}