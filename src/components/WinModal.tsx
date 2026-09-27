"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WinModal() {
  const [won, setWon] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      const wins = (data.items || []).filter(
        (n: any) => n.type === "AUCTION_WON" && !n.readAt
      );
      if (wins.length) setWon(wins);
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
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.8, repeat: 2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-bold text-orange-600 mb-2">Təbriklər!</h2>
          <p className="text-gray-700 mb-2">{item.title}</p>
          <p className="text-sm text-gray-500 mb-6">{item.body}</p>
          <div className="flex gap-2">
            <button
              onClick={close}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium"
            >
              Bağla
            </button>
            {item.link && (
              <Link
                href={item.link}
                onClick={close}
                className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700"
              >
                Elana bax
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}