"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ContactButton({
  sellerId, listingId, fullWidth,
}: { sellerId: string; listingId: string; fullWidth?: boolean }) {
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function start() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: sellerId, listingId }),
    });
    setLoading(false);
    if (!res.ok) return toast.error("Xəta");
    const { id } = await res.json();
    r.push(`/mesajlar/${id}`);
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className={
        fullWidth
          ? "flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50"
          : "bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
      }
    >
      {loading ? "..." : "💬 Mesaj yaz"}
    </button>
  );
}