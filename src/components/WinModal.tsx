"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Notif = {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  readAt?: string | null;
  createdAt: string;
  sellerPhone?: string;
};

export default function WinModal() {
  const [won, setWon] = useState<Notif[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        const wins = (data.items || []).filter(
          (n: Notif) => n.type === "AUCTION_WON" && !n.readAt
        );
        if (wins.length) setWon(wins);
      } catch {}
    }
    check();
  }, []);

  async function close() {
    const item = won[current];
    if (item) {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [item.id] }),
      });
    }
    if (current + 1 < won.length) setCurrent(current + 1);
    else setWon([]);
  }

  const item = won[current];
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-3xl max-w-md w-full p-8 text-center relative overflow-hidden"
        >
          {/* Fon bəzəyi */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-30 blur-2xl" />

          <div className="relative">
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: 2 }}
              className="text-7xl mb-4 inline-block"
            >
              🏆
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent mb-2"
            >
              TƏBRİKLƏR!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 font-semibold mb-2"
            >
              {item.title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 mb-5"
            >
              {item.body}
            </motion.p>

            {item.sellerPhone ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 mb-5"
              >
                <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-2">
                  📞 Satıcı ilə əlaqə saxla
                </div>
                <a
                  href={`tel:${item.sellerPhone}`}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-black text-lg hover:shadow-lg hover:shadow-green-300 transition-all"
                >
                  {item.sellerPhone}
                </a>
              </motion.div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800">
                ℹ️ Satıcı ilə əlaqə üçün elan səhifəsinə keç
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={close}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Bağla
              </button>
              {item.link && (
                <Link
                  href={item.link}
                  onClick={close}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all text-center"
                >
                  Elana bax
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}