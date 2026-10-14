"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ContactButton({
  sellerId,
  listingId,
  fullWidth,
}: {
  sellerId: string;
  listingId: string;
  fullWidth?: boolean;
}) {
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

  if (fullWidth) {
    return (
      <button
        onClick={start}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {loading ? "Açılır..." : "Mesaj yaz"}
      </button>
    );
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {loading ? "..." : "Mesaj"}
    </button>
  );
}