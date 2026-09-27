"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VIPButton({
  listingId, isVip, vipUntil, minPrice, daysLeft,
}: {
  listingId: string; isVip: boolean; vipUntil?: string | null;
  minPrice: number; daysLeft?: number;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(minPrice);
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function buy() {
    if (amount < minPrice) { toast.error(`Minimum ${minPrice} AZN`); return; }
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/vip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setLoading(false);
    if (!res.ok) { toast.error((await res.json()).error); return; }
    const data = await res.json();
    toast.success(`👑 VIP aktivdir! ${data.days} gun`);
    setOpen(false);
    r.refresh();
  }

  const tiers = [
    { days: 1, price: 1 },
    { days: 7, price: 5 },
    { days: 30, price: 15 },
  ].filter(t => t.price >= minPrice);

  if (tiers.length === 0) tiers.push({ days: Math.ceil(minPrice), price: minPrice });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full p-4 rounded-xl font-bold text-sm transition-all ${
          isVip
            ? "bg-gradient-to-r from-amber-400 to-purple-500 text-white shadow-lg shadow-purple-200"
            : "bg-gradient-to-r from-amber-50 to-purple-50 border-2 border-dashed border-purple-300 text-purple-700 hover:border-purple-500"
        }`}
      >
        {isVip
          ? `👑 VIP aktiv (${daysLeft} gun qaldi) — Uzat`
          : `👑 VIP elan et — ${minPrice} AZN-den`}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="text-center">
                <div className="text-5xl mb-2 animate-float">👑</div>
                <h3 className="text-xl font-bold">VIP elan</h3>
                <p className="text-sm text-gray-500 mt-1">
                  VIP elanlar ana sehifede ve kateqoriyada <b>en ustde</b> gosterilir
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Paket sec</div>
                <div className="grid grid-cols-3 gap-2">
                  {tiers.map((t) => (
                    <button
                      key={t.days}
                      onClick={() => setAmount(t.price)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        amount === t.price ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="font-bold text-lg">{t.price} ₼</div>
                      <div className="text-[11px] text-gray-500">{t.days} gun</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ozu isteyini mebleg (min {minPrice} ₼ = 1 gun)</label>
                <input
                  type="number" min={minPrice} value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-purple-500 outline-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  ≈ {Math.floor(amount)} gun VIP
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                ⚠️ <b>Test rejimı</b>: Real odəniş yoxdur. Production-da Stripe/Kapital Bank olacaq.
              </div>

              <div className="flex gap-2">
                <button onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-medium">Legv et</button>
                <button onClick={buy} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-purple-500 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {loading ? "..." : `Al — ${amount} ₼`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}