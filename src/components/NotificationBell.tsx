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
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setItems(data.items);
    setUnread(data.unread);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-xl z-50 max-h-[400px] overflow-auto"
            >
              <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white">
                <span className="font-semibold text-sm">Bildirisler</span>
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs text-orange-600 hover:underline">
                    Hamisini oxu
                  </button>
                )}
              </div>
              {items.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">Bildiris yoxdur</p>
              ) : (
                items.slice(0, 10).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || "#"}
                    onClick={() => setOpen(false)}
                    className={"block p-3 border-b last:border-0 hover:bg-gray-50 " + (!n.readAt ? "bg-orange-50/50" : "")}
                  >
                    <div className="text-sm font-medium">{n.title}</div>
                    {n.body && <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.body}</div>}
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("az-AZ")}
                    </div>
                  </Link>
                ))
              )}
              <Link
                href="/bildirisler"
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-orange-600 py-3 hover:bg-gray-50 border-t"
              >
                Hamisina bax
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}