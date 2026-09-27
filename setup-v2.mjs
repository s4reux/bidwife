import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const files = {};

// ============ LIB ============
files["src/lib/notify.ts"] = `import { prisma } from "./prisma";

export async function notify(
  userId: string,
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  return prisma.notification.create({
    data: { userId, type, title, body: body ?? null, link: link ?? null },
  });
}`;

// ============ UPLOAD API ============
files["src/app/api/upload/route.ts"] = `import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const fd = await req.formData();
  const files = fd.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "Fayl secilmeyib" }, { status: 400 });

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 5 * 1024 * 1024) continue;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const name = randomUUID() + "." + ext;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(join(dir, name), buf);
    urls.push("/uploads/" + name);
  }

  if (!urls.length)
    return NextResponse.json({ error: "Sekil yuklenmedi (max 5MB)" }, { status: 400 });

  return NextResponse.json({ urls });
}`;

// ============ NOTIFICATIONS API ============
files["src/app/api/notifications/route.ts"] = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [], unread: 0 });

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return NextResponse.json({ items, unread });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { ids, all } = await req.json();
  if (all) {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (Array.isArray(ids) && ids.length) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { readAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}`;

// ============ CONVERSATIONS API ============
files["src/app/api/conversations/route.ts"] = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { otherUserId, listingId } = await req.json();
  if (!otherUserId || otherUserId === me.id)
    return NextResponse.json({ error: "Yanlis istifadeci" }, { status: 400 });

  const [a, b] = [me.id, otherUserId].sort();

  const existing = await prisma.conversation.findFirst({
    where: { userAId: a, userBId: b, listingId: listingId ?? null },
  });
  if (existing) return NextResponse.json({ id: existing.id });

  const conv = await prisma.conversation.create({
    data: { userAId: a, userBId: b, listingId: listingId ?? null },
  });
  return NextResponse.json({ id: conv.id });
}`;

// ============ MESSAGES API ============
files["src/app/api/messages/route.ts"] = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function GET(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("conversationId");
  if (!cid) return NextResponse.json({ error: "ID yoxdur" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: cid } });
  if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id))
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  await prisma.message.updateMany({
    where: { conversationId: cid, senderId: { not: me.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: cid },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { sender: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { conversationId, body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Bos mesaj" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id))
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  const otherId = conv.userAId === me.id ? conv.userBId : conv.userAId;

  const [msg] = await Promise.all([
    prisma.message.create({
      data: { conversationId, senderId: me.id, body: body.trim() },
      include: { sender: { select: { id: true, name: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  await notify(otherId, "NEW_MESSAGE", "Yeni mesaj", me.name + ": " + body.slice(0, 60), "/mesajlar/" + conversationId);

  return NextResponse.json(msg);
}`;

// ============ CRON AUCTIONS ============
files["src/app/api/cron/auctions/route.ts"] = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export async function GET() {
  const now = new Date();
  const ended = await prisma.listing.findMany({
    where: { type: "AUCTION", status: "ACTIVE", auctionEnd: { lt: now } },
    include: { bids: { orderBy: { amount: "desc" }, take: 1, include: { user: true } } },
  });

  for (const l of ended) {
    const winner = l.bids[0]?.user;
    const amount = l.bids[0]?.amount;

    await prisma.listing.update({
      where: { id: l.id },
      data: { status: winner ? "SOLD" : "ENDED", winnerId: winner?.id ?? null },
    });

    if (winner) {
      await notify(
        winner.id,
        "AUCTION_WON",
        "🎉 Auksionu qazandin!",
        l.title + " — " + Number(amount).toFixed(2) + " AZN",
        "/elan/" + l.id
      );
    }
    await notify(
      l.sellerId,
      "AUCTION_ENDED",
      "Auksion bitdi",
      winner ? l.title + " — qalib: " + winner.name : l.title + " — teklif olmadi",
      "/elan/" + l.id
    );
  }

  return NextResponse.json({ processed: ended.length });
}`;

// ============ IMAGE UPLOADER COMPONENT ============
files["src/components/ImageUploader.tsx"] = `"use client";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function ImageUploader({
  value, onChange,
}: { value: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange([...value, ...data.urls]);
      toast.success(data.urls.length + " sekil yuklendi");
    } catch (e: any) {
      toast.error(e.message || "Yuklenmedi");
    } finally {
      setUploading(false);
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-orange-600">Yuklenir...</p>
        ) : (
          <>
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm text-gray-600">
              <span className="text-orange-600 font-medium">Sekil sec</span> ve ya buraya at
            </p>
            <p className="text-xs text-gray-400 mt-1">Max 5MB, JPG/PNG/WebP</p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Əsas
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;

// ============ NOTIFICATION BELL ============
files["src/components/NotificationBell.tsx"] = `"use client";
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
}`;

// ============ WIN MODAL ============
files["src/components/WinModal.tsx"] = `"use client";
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
}`;

// ============ HEADER (updated) ============
files["src/components/Header.tsx"] = `import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import NotificationBell from "./NotificationBell";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const user = await getCurrentUser();
  let unreadMsgs = 0;
  if (user) {
    unreadMsgs = await prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: {
          OR: [{ userAId: user.id }, { userBId: user.id }],
        },
      },
    });
  }

  return (
    <header className="bg-white border-b sticky top-0 z-30 backdrop-blur-md bg-white/90">
      <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
        <Link href="/" className="font-extrabold text-2xl text-orange-600">Bazar</Link>
        <nav className="hidden md:flex gap-4 text-sm text-gray-700">
          <Link href="/" className="hover:text-orange-600 transition-colors">Hamisi</Link>
          <Link href="/?type=AUCTION" className="hover:text-orange-600 transition-colors">Auksionlar</Link>
          <Link href="/?type=FIXED" className="hover:text-orange-600 transition-colors">Sabit qiymet</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Link href="/elan/yeni" className="bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-all hover:scale-105">
            + Elan ver
          </Link>
          {user ? (
            <>
              <Link href="/mesajlar" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-xl">💬</span>
                {unreadMsgs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {unreadMsgs > 9 ? "9+" : unreadMsgs}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link href="/kabinet" className="px-2 py-1 hover:text-orange-600 transition-colors">{user.name}</Link>
              <form action="/api/auth/logout" method="POST">
                <button className="text-gray-500 hover:text-red-600 transition-colors">Cixis</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/giris" className="hover:text-orange-600">Giris</Link>
              <Link href="/qeydiyyat" className="bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800">Qeydiyyat</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}`;

// ============ LAYOUT (updated with Toaster + WinModal) ============
files["src/app/layout.tsx"] = `import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import WinModal from "@/components/WinModal";
import AuctionCron from "@/components/AuctionCron";

export const metadata = { title: "Bazar — Auksion & Elan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="antialiased">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6 min-h-[calc(100vh-140px)]">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-8">
          © {new Date().getFullYear()} Bazar.az
        </footer>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <WinModal />
        <AuctionCron />
      </body>
    </html>
  );
}`;

// ============ AUCTION CRON CLIENT ============
files["src/components/AuctionCron.tsx"] = `"use client";
import { useEffect } from "react";

export default function AuctionCron() {
  useEffect(() => {
    fetch("/api/cron/auctions").catch(() => {});
    const t = setInterval(() => fetch("/api/cron/auctions").catch(() => {}), 30000);
    return () => clearInterval(t);
  }, []);
  return null;
}`;

// ============ GLOBALS CSS ============
files["src/app/globals.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: linear-gradient(180deg, #fafafa 0%, #f5f5f7 100%);
    min-height: 100vh;
  }
}

@layer utilities {
  .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

/* Fade in animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeInUp 0.4s ease-out; }
`;

// ============ LISTING CARD (updated with animation) ============
files["src/components/ListingCard.tsx"] = `"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function useCountdown(end?: string | null) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!end) return;
    const update = () => {
      const diff = new Date(end).getTime() - Date.now();
      if (diff <= 0) return setText("Bitib");
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(d > 0 ? \`\${d}g \${h}s \${m}d\` : \`\${h}s \${m}d \${s}sn\`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [end]);
  return text;
}

export default function ListingCard({ l, idx = 0 }: { l: any; idx?: number }) {
  const price = Number(l.price).toFixed(2);
  const topBid = l.bids?.[0]?.amount ? Number(l.bids[0].amount).toFixed(2) : null;
  const ended = l.auctionEnd ? new Date(l.auctionEnd) < new Date() : false;
  const countdown = useCountdown(l.type === "AUCTION" && !ended ? l.auctionEnd : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
    >
      <Link
        href={\`/elan/\${l.id}\`}
        className="group bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:shadow-orange-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {l.images?.[0] ? (
            <img
              src={l.images[0]}
              alt={l.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-300 text-4xl">📦</div>
          )}
          {l.type === "AUCTION" && (
            <span className={\`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full font-medium \${ended ? "bg-gray-800 text-white" : "bg-orange-600 text-white animate-pulse"}\`}>
              {ended ? "Bitdi" : "🔴 Auksion"}
            </span>
          )}
          {l.status === "SOLD" && (
            <span className="absolute top-2 right-2 bg-green-600 text-white text-[11px] px-2 py-0.5 rounded-full">
              Satildi
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <div className="font-semibold text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
            {l.title}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            📍 {l.city || "—"}
          </div>
          <div className="mt-auto pt-2 flex items-end justify-between">
            <div>
              <div className="text-[10px] text-gray-400">{topBid ? "Ən yüksək" : "Qiymət"}</div>
              <div className="text-orange-600 font-bold text-lg leading-tight">
                {topBid ?? price} <span className="text-sm">₼</span>
              </div>
            </div>
            {countdown && (
              <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded">
                ⏱ {countdown}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}`;

// ============ BID BOX (updated with toast) ============
files["src/components/BidBox.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function BidBox({
  listingId, minBid, loggedIn,
}: { listingId: string; minBid: number; loggedIn: boolean }) {
  const [amount, setAmount] = useState(+(minBid + 1).toFixed(2));
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  if (!loggedIn) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg"
      >
        Teklif vermek ucun <Link href="/giris" className="text-orange-600 font-medium">daxil ol</Link>.
      </motion.p>
    );
  }

  async function place() {
    setLoading(true); setErr("");
    const res = await fetch("/api/bids", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, amount }),
    });
    setLoading(false);
    if (!res.ok) {
      const e = (await res.json()).error;
      setErr(e);
      toast.error(e);
      return;
    }
    toast.success("Teklif verildi!");
    r.refresh();
  }

  const quick = [minBid + 1, minBid + 5, minBid + 10, minBid + 25];

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => setAmount(+q.toFixed(2))}
            className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            +{(q - minBid).toFixed(0)} ₼
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          min={minBid + 0.01}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="border p-2.5 rounded-lg flex-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={place}
          disabled={loading}
          className="bg-orange-600 text-white px-5 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
        >
          {loading ? "..." : "Təklif ver"}
        </motion.button>
      </div>
      {err && <p className="text-red-600 text-xs mt-1">{err}</p>}
    </div>
  );
}`;

// ============ HOME PAGE (updated) ============
files["src/app/page.tsx"] = `import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { type?: string; q?: string; cat?: string };
}) {
  const where: any = { status: { in: ["ACTIVE", "SOLD"] } };
  if (searchParams.type === "AUCTION") where.type = "AUCTION";
  if (searchParams.type === "FIXED") where.type = "FIXED";
  if (searchParams.q) where.title = { contains: searchParams.q, mode: "insensitive" };
  if (searchParams.cat) where.category = { slug: searchParams.cat };

  const [listings, categories] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true, title: true, price: true, type: true, status: true,
        city: true, images: true, auctionEnd: true,
        category: { select: { id: true, name: true, slug: true } },
        bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, emoji: true },
    }),
  ]);

  return (
    <div className="animate-in">
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="🔍 Nə axtarırSan?"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
        />
        <button className="bg-orange-600 text-white px-6 rounded-xl hover:bg-orange-700 transition-colors font-medium">
          Axtar
        </button>
      </form>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <Link
          href="/"
          className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all \${
            !searchParams.cat && !searchParams.type
              ? "bg-orange-600 text-white"
              : "bg-white border hover:border-orange-500"
          }\`}
        >
          Hamisi
        </Link>
        <Link
          href="/?type=AUCTION"
          className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all \${
            searchParams.type === "AUCTION"
              ? "bg-orange-600 text-white"
              : "bg-white border hover:border-orange-500"
          }\`}
        >
          🔴 Auksionlar
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={\`/?cat=\${c.slug}\`}
            className={\`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all \${
              searchParams.cat === c.slug
                ? "bg-orange-600 text-white"
                : "bg-white border hover:border-orange-500"
            }\`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
      </div>
      {listings.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500">Elan tapilmadi.</p>
        </div>
      )}
    </div>
  );
}`;

// ============ NEW LISTING FORM (updated with ImageUploader) ============
files["src/app/elan/yeni/form.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function NewListingForm({
  categories,
}: { categories: { id: string; name: string; emoji: string }[] }) {
  const r = useRouter();
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      price: Number(fd.get("price")),
      city: fd.get("city") || null,
      categoryId: fd.get("categoryId") || null,
      type,
      auctionEnd: type === "AUCTION" ? fd.get("auctionEnd") : null,
      images,
    };
    const res = await fetch("/api/listings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error((await res.json()).error);
      return;
    }
    const { id } = await res.json();
    toast.success("Elan yaradildi!");
    r.push(\`/elan/\${id}\`); r.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5 max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold">Yeni elan</h1>

      <div className="grid grid-cols-2 gap-3">
        {(["FIXED", "AUCTION"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={\`p-4 rounded-xl border-2 text-left transition-all \${
              type === t
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-orange-300"
            }\`}
          >
            <div className="text-2xl mb-1">{t === "FIXED" ? "💰" : "🔴"}</div>
            <div className="font-semibold text-sm">{t === "FIXED" ? "Sabit qiymet" : "Auksion"}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {t === "FIXED" ? "Birbasa satis" : "Teklifle satis"}
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Sekiller</label>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <input
        name="title" required placeholder="Basliq"
        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
      />
      <textarea
        name="description" required rows={4} placeholder="Tesvir"
        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          name="price" required type="number" step="0.01"
          placeholder={type === "AUCTION" ? "Baslangic qiymet (AZN)" : "Qiymet (AZN)"}
          className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <input
          name="city" placeholder="Seher"
          className="border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
        />
      </div>

      <select
        name="categoryId"
        className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
      >
        <option value="">Kateqoriya sec</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
        ))}
      </select>

      {type === "AUCTION" && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Auksion bitme tarixi</label>
          <input
            name="auctionEnd" required type="datetime-local"
            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium transition-colors"
      >
        {loading ? "Gonderilir..." : "Yerlesdir"}
      </motion.button>
    </motion.form>
  );
}`;

// ============ UPDATED NEW LISTING PAGE ============
files["src/app/elan/yeni/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import NewListingForm from "./form";

export default async function NewListing() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, emoji: true },
  });
  return <NewListingForm categories={categories} />;
}`;

// ============ LISTING DETAIL PAGE (updated with chat button) ============
files["src/app/elan/[id]/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import BidBox from "@/components/BidBox";
import Link from "next/link";
import ContactButton from "./ContactButton";
import Gallery from "./Gallery";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, phone: true, email: true } },
      category: { select: { name: true, slug: true } },
      bids: {
        orderBy: { amount: "desc" },
        take: 30,
        select: {
          id: true, amount: true, createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  if (!listing) notFound();

  const me = await getCurrentUser();
  const topBid = listing.bids[0]?.amount ?? null;
  const isAuction = listing.type === "AUCTION";
  const ended = listing.auctionEnd ? new Date(listing.auctionEnd) < new Date() : false;
  const isOwner = me?.id === listing.sellerId;
  const isWinner = listing.winnerId === me?.id;

  return (
    <div className="animate-in grid md:grid-cols-2 gap-8">
      <Gallery images={listing.images} title={listing.title} />

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
          {listing.category && (
            <Link
              href={\`/?cat=\${listing.category.slug}\`}
              className="inline-block text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full mt-2"
            >
              {listing.category.name}
            </Link>
          )}
        </div>

        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 text-white rounded-full grid place-items-center font-bold">
            {listing.seller.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{listing.seller.name}</div>
            <div className="text-xs text-gray-500">
              {listing.city && <>📍 {listing.city} • </>}
              {new Date(listing.createdAt).toLocaleDateString("az-AZ")}
            </div>
          </div>
          {!isOwner && me && (
            <ContactButton sellerId={listing.seller.id} listingId={listing.id} />
          )}
        </div>

        <div className="border-t pt-4">
          {isAuction ? (
            <>
              {isWinner && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 text-center">
                  <div className="text-3xl mb-1">🏆</div>
                  <div className="font-bold text-green-700">Bu auksionu sən qazandın!</div>
                  {listing.seller.phone && (
                    <div className="text-sm text-green-700 mt-2">
                      Satıcı ilə əlaqə: <span className="font-bold">{listing.seller.phone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-500">
                {ended ? "Auksion bitdi" : "Cari ən yüksək təklif"}
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {Number(topBid ?? listing.price).toFixed(2)} ₼
              </div>
              {listing.auctionEnd && (
                <div className="text-xs text-gray-500 mt-1">
                  Bitmə: {new Date(listing.auctionEnd).toLocaleString("az-AZ")}
                </div>
              )}

              {!ended && !isOwner && (
                <BidBox listingId={listing.id} minBid={Number(topBid ?? listing.price)} loggedIn={!!me} />
              )}
              {isOwner && <p className="text-xs text-gray-500 mt-2">Bu sənin elanındır.</p>}
              {!me && !ended && (
                <p className="text-sm text-gray-500 mt-2">
                  Təklif vermək üçün <Link href="/giris" className="text-orange-600 font-medium">daxil ol</Link>.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-orange-600">
                {Number(listing.price).toFixed(2)} ₼
              </div>
              {!isOwner && listing.seller.phone && me && (
                <div className="mt-3 bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-700">Əlaqə nömrəsi</div>
                    <div className="font-bold text-lg">{listing.seller.phone}</div>
                  </div>
                  <a href={\`tel:\${listing.seller.phone}\`} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                    Zəng et
                  </a>
                </div>
              )}
              {!me && (
                <p className="text-sm text-gray-500 mt-2">
                  Əlaqə üçün <Link href="/giris" className="text-orange-600 font-medium">daxil ol</Link>.
                </p>
              )}
            </>
          )}
        </div>

        {isAuction && listing.bids.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="font-semibold mb-3">Təkliflər ({listing.bids.length})</h2>
            <ul className="text-sm space-y-1 max-h-72 overflow-auto">
              {listing.bids.map((b, i) => (
                <li
                  key={b.id}
                  className={\`flex justify-between py-2 px-3 rounded \${
                    i === 0 ? "bg-orange-50 font-medium" : "border-b"
                  }\`}
                >
                  <span>{i === 0 && "👑 "}{b.user.name}</span>
                  <span>{Number(b.amount).toFixed(2)} ₼</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}`;

files["src/app/elan/[id]/ContactButton.tsx"] = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ContactButton({ sellerId, listingId }: { sellerId: string; listingId: string }) {
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
    if (!res.ok) return toast.error("Xeta");
    const { id } = await res.json();
    r.push(\`/mesajlar/\${id}\`);
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "💬 Mesaj"}
    </button>
  );
}`;

files["src/app/elan/[id]/Gallery.tsx"] = `"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl grid place-items-center text-gray-300 text-6xl">
        📦
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={\`aspect-square rounded-lg overflow-hidden border-2 transition-all \${
                i === active ? "border-orange-500 scale-95" : "border-transparent opacity-70 hover:opacity-100"
              }\`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}`;

// ============ MESSAGES PAGE ============
files["src/app/mesajlar/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/giris");

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true, images: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderId: true, readAt: true } },
    },
  });

  const withUnread = await Promise.all(
    convs.map(async (c) => {
      const unread = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: me.id }, readAt: null },
      });
      return { ...c, unread };
    })
  );

  return (
    <div className="animate-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Mesajlar</h1>
      {withUnread.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-6xl mb-3">💬</div>
          <p className="text-gray-500">Hələ mesaj yoxdur.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {withUnread.map((c) => {
            const other = c.userAId === me.id ? c.userB : c.userA;
            const last = c.messages[0];
            return (
              <Link
                key={c.id}
                href={\`/mesajlar/\${c.id}\`}
                className="flex gap-3 bg-white p-3 rounded-xl border hover:border-orange-300 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white grid place-items-center font-bold flex-shrink-0">
                  {other.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold text-sm">{other.name}</div>
                    {last && (
                      <div className="text-[10px] text-gray-400">
                        {new Date(last.createdAt).toLocaleString("az-AZ")}
                      </div>
                    )}
                  </div>
                  {c.listing && (
                    <div className="text-xs text-orange-600 truncate">📦 {c.listing.title}</div>
                  )}
                  <div className="text-sm text-gray-600 truncate">
                    {last ? (last.senderId === me.id ? "Sən: " : "") + last.body : "Mesaj yoxdur"}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 grid place-items-center flex-shrink-0 self-center">
                    {c.unread}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}`;

files["src/app/mesajlar/[id]/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import Chat from "./Chat";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) redirect("/giris");

  const conv = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true, images: true } },
    },
  });
  if (!conv || (conv.userAId !== me.id && conv.userBId !== me.id)) notFound();

  const other = conv.userAId === me.id ? conv.userB : conv.userA;

  return (
    <Chat
      conversationId={conv.id}
      meId={me.id}
      otherName={other.name}
      listing={conv.listing ? { id: conv.listing.id, title: conv.listing.title } : null}
    />
  );
}`;

files["src/app/mesajlar/[id]/Chat.tsx"] = `"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Msg = { id: string; senderId: string; body: string; createdAt: string; sender: { id: string; name: string } };

export default function Chat({
  conversationId, meId, otherName, listing,
}: {
  conversationId: string;
  meId: string;
  otherName: string;
  listing: { id: string; title: string } | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(\`/api/messages?conversationId=\${conversationId}\`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const body = text;
    setText("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, body }),
    });
    setSending(false);
    if (res.ok) load();
  }

  return (
    <div className="animate-in max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-white border rounded-t-2xl p-3 flex items-center gap-3">
        <Link href="/mesajlar" className="text-gray-400 hover:text-gray-600">←</Link>
        <div className="w-10 h-10 rounded-full bg-orange-600 text-white grid place-items-center font-bold">
          {otherName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{otherName}</div>
          {listing && (
            <Link href={\`/elan/\${listing.id}\`} className="text-xs text-orange-600 hover:underline truncate block">
              📦 {listing.title}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Mesaj yoxdur. Ilk mesaji yaz!</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const mine = m.senderId === meId;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={\`flex \${mine ? "justify-end" : "justify-start"}\`}
              >
                <div className={\`max-w-[70%] px-3 py-2 rounded-2xl text-sm \${
                  mine
                    ? "bg-orange-600 text-white rounded-br-sm"
                    : "bg-white border rounded-bl-sm"
                }\`}>
                  <div>{m.body}</div>
                  <div className={\`text-[10px] mt-0.5 \${mine ? "text-orange-100" : "text-gray-400"}\`}>
                    {new Date(m.createdAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="bg-white border border-t-0 rounded-b-2xl p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-1 border rounded-full px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={sending || !text.trim()}
          className="bg-orange-600 text-white px-5 rounded-full disabled:opacity-50 font-medium"
        >
          ➤
        </motion.button>
      </form>
    </div>
  );
}`;

// ============ NOTIFICATIONS PAGE ============
files["src/app/bildirisler/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  AUCTION_WON: "🏆",
  AUCTION_ENDED: "🔨",
  NEW_MESSAGE: "💬",
  OUTBID: "⚠️",
  BID_PLACED: "📢",
};

export default async function NotificationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/giris");

  const items = await prisma.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  await prisma.notification.updateMany({
    where: { userId: me.id, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="animate-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Bildirisler</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-6xl mb-3">🔔</div>
          <p className="text-gray-500">Bildiris yoxdur.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={\`flex gap-3 bg-white p-4 rounded-xl border hover:border-orange-300 transition-all \${
                !n.readAt ? "border-l-4 border-l-orange-500" : ""
              }\`}
            >
              <div className="text-2xl">{ICONS[n.type] || "📌"}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{n.title}</div>
                {n.body && <div className="text-sm text-gray-600 mt-0.5">{n.body}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString("az-AZ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}`;

// ============ UPDATED BIDS API (with notifications) ============
files["src/app/api/bids/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const s = z.object({ listingId: z.string(), amount: z.number().positive() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlis melumat" }, { status: 400 });
  const { listingId, amount } = p.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });
  if (!listing || listing.type !== "AUCTION")
    return NextResponse.json({ error: "Auksion tapilmadi" }, { status: 404 });
  if (listing.sellerId === user.id)
    return NextResponse.json({ error: "Oz elanina teklif vere bilmezsen" }, { status: 400 });
  if (listing.auctionEnd && new Date(listing.auctionEnd) < new Date())
    return NextResponse.json({ error: "Auksion bitib" }, { status: 400 });

  const top = listing.bids[0];
  if (amount <= Number(top?.amount ?? listing.price))
    return NextResponse.json({ error: \`Teklif \${Number(top?.amount ?? listing.price).toFixed(2)} AZN-den boyuk olmalidir\` }, { status: 400 });

  await prisma.bid.create({ data: { listingId, amount, userId: user.id } });

  // Satıcıya bildiriş
  await notify(
    listing.sellerId,
    "BID_PLACED",
    "Yeni teklif!",
    user.name + " — " + listing.title + " (" + amount.toFixed(2) + " AZN)",
    "/elan/" + listingId
  );

  // Əvvəlki ən yüksək təklif sahibinə bildiriş
  if (top && top.userId !== user.id) {
    await notify(
      top.userId,
      "OUTBID",
      "Teklifinizi keçdilər",
      listing.title + " — yeni teklif: " + amount.toFixed(2) + " AZN",
      "/elan/" + listingId
    );
  }

  return NextResponse.json({ ok: true });
}`;

// ============ UPDATED LISTINGS API (better validation) ============
files["src/app/api/listings/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(3).max(3000),
  price: z.number().positive(),
  type: z.enum(["FIXED", "AUCTION"]),
  city: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  auctionEnd: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });
  const d = p.data;

  const listing = await prisma.listing.create({
    data: {
      title: d.title, description: d.description, price: d.price,
      type: d.type, city: d.city ?? null, images: d.images,
      auctionEnd: d.auctionEnd ? new Date(d.auctionEnd) : null,
      categoryId: d.categoryId ?? null,
      sellerId: user.id,
    },
  });
  return NextResponse.json({ id: listing.id });
}`;

// ============ LOADING SKELETONS ============
files["src/app/loading.tsx"] = `export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl mb-6"></div>
      <div className="flex gap-2 mb-5">
        {[1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

files["src/app/elan/[id]/loading.tsx"] = `export default function Loading() {
  return (
    <div className="animate-pulse grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}`;

let count = 0;
for (const [path, content] of Object.entries(files)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  count++;
  console.log("  ✓", path);
}

console.log("\n✅ " + count + " fayl yaradildi/yenilendi!");
console.log("\n🚀 Sonra:");
console.log("   npx prisma db push");
console.log("   npm run dev");