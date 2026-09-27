"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function BidBox({
  listingId, minBid, loggedIn,
}: { listingId: string; minBid: number; loggedIn: boolean }) {
  // 🔑 STRING state — "0" problemi həll olur
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  if (!loggedIn) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-500 mt-3 bg-gray-50 p-3 rounded-xl"
      >
        Təklif vermək üçün <Link href="/giris" className="text-orange-600 font-medium">daxil ol</Link>.
      </motion.p>
    );
  }

  // Sürətli +N düymələri
  const quick = [
    { label: "+1", value: minBid + 1 },
    { label: "+5", value: minBid + 5 },
    { label: "+10", value: minBid + 10 },
    { label: "+25", value: minBid + 25 },
    { label: "+100", value: minBid + 100 },
  ];

  async function place() {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErr("Məbləğ yazın");
      toast.error("Məbləğ yazın");
      return;
    }
    if (numAmount <= minBid) {
      const msg = `Təklif ${minBid.toFixed(2)} ₼-dən böyük olmalıdır`;
      setErr(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    setErr("");
    const res = await fetch("/api/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, amount: numAmount }),
    });
    setLoading(false);
    if (!res.ok) {
      const e = (await res.json()).error;
      setErr(e);
      toast.error(e);
      return;
    }
    toast.success("✅ Təklif verildi!");
    setAmount("");
    r.refresh();
  }

  return (
    <div className="mt-3">
      {/* Sürətli düymələr */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => setAmount(String(q.value))}
            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-colors font-medium"
          >
            {q.label} ₼
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            // Yalnız rəqəm və nöqtə
            const val = e.target.value.replace(/[^0-9.]/g, "");
            setAmount(val);
          }}
          onFocus={(e) => {
            // Fokus olduqda 0-ı sil
            if (amount === "0") setAmount("");
          }}
          placeholder={`Min: ${(minBid + 0.01).toFixed(2)} ₼`}
          className="border-2 border-gray-200 p-3 rounded-xl flex-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={place}
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 rounded-xl hover:shadow-lg disabled:opacity-50 font-bold whitespace-nowrap"
        >
          {loading ? "..." : "Təklif ver"}
        </motion.button>
      </div>
      {err && <p className="text-red-600 text-xs mt-1.5">{err}</p>}
    </div>
  );
}