import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const files = {};

// ============ GLOBALS CSS — MODERN DIZAYN ============
files["src/app/globals.css"] = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: radial-gradient(ellipse at top, #fff7ed 0%, #f9fafb 40%, #f3f4f6 100%);
    min-height: 100vh;
  }
  * { -webkit-tap-highlight-color: transparent; }
}

@layer utilities {
  .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .glass { background: rgba(255,255,255,0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
  .glass-dark { background: rgba(0,0,0,0.75); backdrop-filter: blur(20px); }
  .gradient-text { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .vip-gradient { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #8b5cf6 70%, #6366f1 100%); }
  .vip-border { background: linear-gradient(135deg, #fbbf24, #8b5cf6); padding: 2px; border-radius: 1rem; }
  .card-hover { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -15px rgba(249,115,22,0.2); }
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 5px; border: 2px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: #d1d5db; background-clip: padding-box; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.animate-in { animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1); }
.animate-float { animation: float 3s ease-in-out infinite; }
.shimmer { background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%); background-size: 1000px 100%; animation: shimmer 2s infinite linear; }
`;

// ============ HEADER — MODERN GLASSMORPHISM ============
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
        conversation: { OR: [{ userAId: user.id }, { userBId: user.id }] },
      },
    });
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-text bg-gradient-to-br from-orange-500 to-red-600 grid place-items-center text-white font-black text-lg group-hover:scale-110 transition-transform">
            B
          </div>
          <span className="font-black text-xl gradient-text hidden sm:inline">Bazar</span>
        </Link>

        <nav className="hidden md:flex gap-1 text-sm">
          <Link href="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">Hamısı</Link>
          <Link href="/kateqoriyalar" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">Kateqoriyalar</Link>
          <Link href="/?type=AUCTION" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">🔴 Auksionlar</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 text-sm">
          <Link
            href="/elan/yeni"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium flex items-center gap-1.5 text-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Elan ver</span>
          </Link>

          {user ? (
            <>
              <Link href="/mesajlar" className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <span className="text-lg">💬</span>
                {unreadMsgs > 0 && (
                  <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">
                    {unreadMsgs > 9 ? "9+" : unreadMsgs}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link href="/kabinet" className="hidden sm:flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white grid place-items-center font-bold text-sm">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
              </Link>
              <form action="/api/auth/logout" method="POST" className="hidden sm:block">
                <button className="text-gray-400 hover:text-red-600 transition-colors p-2" title="Çıxış">
                  ⏻
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/giris" className="px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium">Giriş</Link>
              <Link href="/qeydiyyat" className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors font-medium">Qeydiyyat</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}`;

// ============ LISTING CARD — MODERN + VIP ============
files["src/components/ListingCard.tsx"] = `"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
      if (d > 0) setText(\`\${d}g \${h}s\`);
      else if (h > 0) setText(\`\${h}s \${m}d \${s}sn\`);
      else setText(\`\${m}d \${s}sn\`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [end]);
  return { text, urgent };
}

const CONDITION_LABEL: Record<string, string> = { NEW: "Yeni", LIKE_NEW: "Yeni kimi", USED: "İşlənmiş" };

export default function ListingCard({ l, idx = 0 }: { l: any; idx?: number }) {
  const price = Number(l.price).toFixed(2);
  const topBid = l.bids?.[0]?.amount ? Number(l.bids[0].amount).toFixed(2) : null;
  const ended = l.auctionEnd ? new Date(l.auctionEnd) < new Date() : false;
  const { text: countdown, urgent } = useCountdown(l.type === "AUCTION" && !ended ? l.auctionEnd : null);
  const isVip = l.vipUntil && new Date(l.vipUntil) > new Date();

  const inner = (
    <Link href={\`/elan/\${l.id}\`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-gray-100 card-hover">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
          {l.images?.[0] ? (
            <img src={l.images[0]} alt={l.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-300 text-5xl">📦</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {l.type === "AUCTION" && (
            <div className={\`absolute top-2.5 left-2.5 text-[11px] px-2.5 py-1 rounded-full font-bold backdrop-blur-sm \${
              ended ? "bg-gray-900/80 text-white" : "bg-red-500/90 text-white animate-pulse"
            }\`}>
              {ended ? "Bitdi" : "🔴 AUKSION"}
            </div>
          )}

          {l.condition && l.condition !== "USED" && (
            <div className="absolute top-2.5 right-2.5 bg-green-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">
              {CONDITION_LABEL[l.condition]}
            </div>
          )}
        </div>

        <div className="p-3.5 flex-1 flex flex-col">
          <div className="font-semibold text-[13.5px] leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
            {l.title}
          </div>
          <div className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            <span>📍</span> {l.city || "—"}
          </div>

          <div className="mt-auto pt-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                {topBid ? "Ən yüksək" : "Qiymət"}
              </div>
              <div className="text-orange-600 font-black text-lg leading-tight truncate">
                {topBid ?? price} <span className="text-sm">₼</span>
              </div>
            </div>
            {l.type === "AUCTION" && !ended && countdown && (
              <div className={\`text-[10.5px] font-bold px-2 py-1 rounded-lg whitespace-nowrap \${
                urgent ? "bg-red-600 text-white animate-pulse" : "bg-red-50 text-red-600 border border-red-100"
              }\`}>
                ⏱ {countdown}
              </div>
            )}
            {l.type === "AUCTION" && ended && (
              <div className="text-[10.5px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">Bitdi</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
      className="relative"
    >
      {isVip ? (
        <div className="vip-border shadow-lg shadow-purple-200/50">
          <div className="relative rounded-[14px] overflow-hidden bg-white">
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -translate-y-1/2 pt-2 pointer-events-none">
              <span className="bg-gradient-to-r from-amber-400 to-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                👑 VIP ELAN
              </span>
            </div>
            <div className="pt-3">{inner}</div>
          </div>
        </div>
      ) : inner}
    </motion.div>
  );
}`;

// ============ VIP BUTTON ============
files["src/app/elan/[id]/VIPButton.tsx"] = `"use client";
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
    if (amount < minPrice) { toast.error(\`Minimum \${minPrice} AZN\`); return; }
    setLoading(true);
    const res = await fetch(\`/api/listings/\${listingId}/vip\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setLoading(false);
    if (!res.ok) { toast.error((await res.json()).error); return; }
    const data = await res.json();
    toast.success(\`👑 VIP aktivdir! \${data.days} gun\`);
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
        className={\`w-full p-4 rounded-xl font-bold text-sm transition-all \${
          isVip
            ? "bg-gradient-to-r from-amber-400 to-purple-500 text-white shadow-lg shadow-purple-200"
            : "bg-gradient-to-r from-amber-50 to-purple-50 border-2 border-dashed border-purple-300 text-purple-700 hover:border-purple-500"
        }\`}
      >
        {isVip
          ? \`👑 VIP aktiv (\${daysLeft} gun qaldi) — Uzat\`
          : \`👑 VIP elan et — \${minPrice} AZN-den\`}
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
                      className={\`p-3 rounded-xl border-2 text-center transition-all \${
                        amount === t.price ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                      }\`}
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
                  {loading ? "..." : \`Al — \${amount} ₼\`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}`;

// ============ VIP API ============
files["src/app/api/listings/[id]/vip/route.ts"] = `import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { amount } = await req.json();
  if (typeof amount !== "number" || amount <= 0)
    return NextResponse.json({ error: "Yanlis mebleg" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  const minPrice = Number(listing.category?.vipMinPrice ?? 1);
  if (amount < minPrice)
    return NextResponse.json({ error: \`Minimum \${minPrice} AZN\` }, { status: 400 });

  const days = Math.floor(amount);
  const base = listing.vipUntil && listing.vipUntil > new Date() ? listing.vipUntil : new Date();
  const newVipUntil = new Date(base.getTime() + days * 86400000);

  await prisma.listing.update({
    where: { id: params.id },
    data: {
      vipUntil: newVipUntil,
      vipPaid: { increment: amount },
    },
  });

  await notify(
    user.id, "VIP_ACTIVATED", "👑 VIP aktiv edildi",
    \`\${listing.title} — \${days} gun\`,
    "/elan/" + params.id
  );

  return NextResponse.json({ days, until: newVipUntil });
}`;

// ============ EDIT/DELETE API ============
files["src/app/api/listings/[id]/route.ts"] = `import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(3).max(3000).optional(),
  price: z.number().positive().optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "USED"]).optional(),
  city: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "ENDED", "SOLD"]).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id && !user.isAdmin)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: p.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id && !user.isAdmin)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}`;

// ============ EDIT PAGE ============
files["src/app/elan/[id]/duzenle/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import EditForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [listing, categories] = await Promise.all([
    prisma.listing.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, emoji: true, parentId: true },
    }),
  ]);

  if (!listing) notFound();
  if (listing.sellerId !== user.id && !user.isAdmin) redirect("/");

  return <EditForm listing={{
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price),
    condition: listing.condition,
    city: listing.city,
    images: listing.images,
    categoryId: listing.categoryId,
    type: listing.type,
  }} categories={categories} />;
}`;

files["src/app/elan/[id]/duzenle/form.tsx"] = `"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";

type Cat = { id: string; name: string; emoji: string; parentId: string | null };

export default function EditForm({
  listing, categories,
}: {
  listing: {
    id: string; title: string; description: string; price: number;
    condition: string; city: string | null; images: string[];
    categoryId: string | null; type: string;
  };
  categories: Cat[];
}) {
  const r = useRouter();
  const [condition, setCondition] = useState<"NEW" | "LIKE_NEW" | "USED">(listing.condition as any);
  const [images, setImages] = useState<string[]>(listing.images);
  const [loading, setLoading] = useState(false);

  const initialParents = useMemo(() => {
    if (!listing.categoryId) return { parentId: "", childId: "", grandId: "" };
    const cat = categories.find((c) => c.id === listing.categoryId);
    if (!cat) return { parentId: "", childId: "", grandId: "" };
    if (!cat.parentId) return { parentId: cat.id, childId: "", grandId: "" };
    const parent = categories.find((c) => c.id === cat.parentId);
    if (parent && !parent.parentId) return { parentId: parent.id, childId: cat.id, grandId: "" };
    if (parent && parent.parentId) {
      const grand = categories.find((c) => c.id === parent.parentId);
      if (grand) return { parentId: grand.id, childId: parent.id, grandId: cat.id };
    }
    return { parentId: "", childId: "", grandId: "" };
  }, [listing.categoryId, categories]);

  const [parentId, setParentId] = useState(initialParents.parentId);
  const [childId, setChildId] = useState(initialParents.childId);
  const [grandId, setGrandId] = useState(initialParents.grandId);

  const parents = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const children = useMemo(() => categories.filter((c) => c.parentId === parentId), [categories, parentId]);
  const grandchildren = useMemo(() => categories.filter((c) => c.parentId === childId), [categories, childId]);

  const finalCategoryId = grandId || childId || parentId;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title"),
      description: fd.get("description"),
      price: Number(fd.get("price")),
      city: fd.get("city") || null,
      categoryId: finalCategoryId || null,
      condition,
      images,
    };
    const res = await fetch(\`/api/listings/\${listing.id}\`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) { toast.error((await res.json()).error); return; }
    toast.success("Yenilendi!");
    r.push(\`/elan/\${listing.id}\`);
    r.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Elani redakte et</h1>
        <Link href={\`/elan/\${listing.id}\`} className="text-sm text-gray-500 hover:text-orange-600">← Geri</Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
        ℹ️ Elan novu ({listing.type === "AUCTION" ? "Auksion" : "Sabit qiymet"}) deyisdirile bilmez
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Sekiller</label>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <input name="title" required defaultValue={listing.title} placeholder="Basliq"
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />

      <textarea name="description" required rows={4} defaultValue={listing.description} placeholder="Tesvir"
        className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" />

      <div className="grid grid-cols-2 gap-3">
        <input name="price" required type="number" step="0.01" defaultValue={listing.price}
          className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
        <select name="city" defaultValue={listing.city || ""}
          className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
          <option value="">Seher sec</option>
          {["Bakı","Sumqayıt","Gəncə","Mingəçevir","Şirvan","Naxçıvan","Lənkəran","Yevlax","Şəki","Xankəndi","Şuşa","Quba","Qusar","Zaqatala","Digər"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Veziyyet</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: "NEW", l: "🆕 Yeni" },
            { v: "LIKE_NEW", l: "✨ Yeni kimi" },
            { v: "USED", l: "📦 İşlənmiş" },
          ].map((c) => (
            <button key={c.v} type="button" onClick={() => setCondition(c.v as any)}
              className={\`p-3 rounded-xl text-sm border-2 transition-all \${
                condition === c.v ? "border-orange-500 bg-orange-50 font-medium" : "border-gray-200 hover:border-orange-300"
              }\`}>
              {c.l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 block">Kateqoriya</label>
        <select value={parentId} onChange={(e) => { setParentId(e.target.value); setChildId(""); setGrandId(""); }}
          className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
          <option value="">— Esas kateqoriya sec —</option>
          {parents.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        {children.length > 0 && (
          <select value={childId} onChange={(e) => { setChildId(e.target.value); setGrandId(""); }}
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">— Alt kateqoriya sec —</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        )}
        {grandchildren.length > 0 && (
          <select value={grandId} onChange={(e) => setGrandId(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">— Model sec —</option>
            {grandchildren.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.98 }} disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:shadow-lg font-bold disabled:opacity-50">
        {loading ? "Yenilenir..." : "Yadda saxla"}
      </motion.button>
    </motion.form>
  );
}`;

// ============ KABINET ACTIONS ============
files["src/app/kabinet/ListingActions.tsx"] = `"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ListingActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function del() {
    if (!confirm("Elanı silmək istədiyinə əminsən?")) return;
    setLoading(true);
    const res = await fetch(\`/api/listings/\${id}\`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) { toast.error("Silinmedi"); return; }
    toast.success("Silindi");
    r.refresh();
  }

  return (
    <div className="flex gap-1.5">
      <Link href={\`/elan/\${id}/duzenle\`}
        className="flex-1 text-center text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded-lg font-medium transition-colors">
        ✏️ Redaktə
      </Link>
      <button onClick={del} disabled={loading}
        className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
        {loading ? "..." : "🗑️ Sil"}
      </button>
    </div>
  );
}`;

// ============ HOME PAGE — VIP SECTION ============
files["src/app/page.tsx"] = `import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: {
    type?: string; q?: string; cat?: string; city?: string;
    condition?: string; minPrice?: string; maxPrice?: string;
  };
}) {
  const now = new Date();

  const where: any = {
    OR: [
      { type: "FIXED", status: "ACTIVE" },
      { type: "AUCTION", status: "ACTIVE", auctionEnd: { gt: now } },
    ],
  };

  if (searchParams.type === "AUCTION") where.OR = [{ type: "AUCTION", status: "ACTIVE", auctionEnd: { gt: now } }];
  if (searchParams.type === "FIXED") where.OR = [{ type: "FIXED", status: "ACTIVE" }];
  if (searchParams.q) {
    where.AND = [{
      OR: [
        { title: { contains: searchParams.q, mode: "insensitive" } },
        { description: { contains: searchParams.q, mode: "insensitive" } },
      ],
    }];
  }
  if (searchParams.cat) where.category = { slug: searchParams.cat };
  if (searchParams.city) where.city = searchParams.city;
  if (searchParams.condition) where.condition = searchParams.condition;
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = Number(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = Number(searchParams.maxPrice);
  }

  const select = {
    id: true, title: true, price: true, type: true, status: true,
    city: true, images: true, auctionEnd: true, condition: true, vipUntil: true,
    category: { select: { id: true, name: true, slug: true } },
    bids: { orderBy: { amount: "desc" } as const, take: 1, select: { amount: true } },
  };

  const [vipListings, regularListings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { ...where, vipUntil: { gt: now } },
      orderBy: { vipUntil: "desc" },
      take: 8,
      select,
    }),
    prisma.listing.findMany({
      where: { ...where, OR: [{ vipUntil: null }, { vipUntil: { lte: now } }] },
      orderBy: { createdAt: "desc" },
      take: 60,
      select,
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, emoji: true },
    }),
  ]);

  const isSearching = !!(searchParams.q || searchParams.cat || searchParams.city || searchParams.type || searchParams.condition || searchParams.minPrice || searchParams.maxPrice);

  const activeFilters = [
    searchParams.cat && { k: "Kateqoriya", v: searchParams.cat },
    searchParams.city && { k: "Şəhər", v: searchParams.city },
    searchParams.condition && { k: "Vəziyyət", v: { NEW: "Yeni", LIKE_NEW: "Yeni kimi", USED: "İşlənmiş" }[searchParams.condition] || searchParams.condition },
    searchParams.type && { k: "Növ", v: { AUCTION: "Auksion", FIXED: "Sabit" }[searchParams.type] || searchParams.type },
    (searchParams.minPrice || searchParams.maxPrice) && { k: "Qiymət", v: \`\${searchParams.minPrice || "0"} — \${searchParams.maxPrice || "∞"} ₼\` },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div className="animate-in">
      {!isSearching && (
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span className="gradient-text">Al, sat, auksion</span> et
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Azərbaycanın müasir onlayn bazarı — minlərlə elan bir yerdə
          </p>
        </div>
      )}

      <FilterBar categories={categories} />

      {!isSearching && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          <Link href="/" className="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white">Hamısı</Link>
          <Link href="/?type=AUCTION" className="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium bg-white border hover:border-orange-500 transition-all">🔴 Auksionlar</Link>
          {categories.slice(0, 10).map((c) => (
            <Link key={c.id} href={\`/?cat=\${c.slug}\`}
              className="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium bg-white border hover:border-orange-500 transition-all">
              {c.emoji} {c.name}
            </Link>
          ))}
          <Link href="/kateqoriyalar" className="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
            Hamısı →
          </Link>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-xs text-gray-500 font-medium">Filtrlər:</span>
          {activeFilters.map((f, i) => (
            <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-medium">
              {f.k}: {f.v}
            </span>
          ))}
          <Link href="/" className="text-xs text-red-600 hover:underline ml-1 font-medium">✕ təmizlə</Link>
        </div>
      )}

      {vipListings.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">👑</div>
            <h2 className="font-black text-lg bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
              VIP ELANLAR
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vipListings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
          </div>
        </section>
      )}

      <div className="text-xs text-gray-500 mb-3 font-medium">
        {regularListings.length} elan {isSearching && "tapıldı"}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {regularListings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
      </div>

      {regularListings.length === 0 && vipListings.length === 0 && (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">🔍</div>
          <p className="text-gray-500 font-bold text-lg">Elan tapılmadı</p>
          <p className="text-sm text-gray-400 mt-1">Filtrləri dəyiş və yenidən yoxla</p>
          <Link href="/" className="inline-block mt-5 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-700">
            Filtrləri təmizlə
          </Link>
        </div>
      )}
    </div>
  );
}`;

// ============ ELAN DETAIL — VIP BUTTON INTEGRATION ============
files["src/app/elan/[id]/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import BidBox from "@/components/BidBox";
import Link from "next/link";
import ContactButton from "./ContactButton";
import Gallery from "./Gallery";
import VIPButton from "./VIPButton";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, phone: true, email: true } },
      category: { select: { name: true, slug: true, vipMinPrice: true } },
      bids: {
        orderBy: { amount: "desc" }, take: 30,
        select: { id: true, amount: true, createdAt: true, user: { select: { name: true } } },
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
  const isVip = listing.vipUntil && listing.vipUntil > new Date();
  const daysLeft = isVip ? Math.ceil((listing.vipUntil!.getTime() - Date.now()) / 86400000) : 0;

  return (
    <div className="animate-in grid md:grid-cols-2 gap-8">
      <div className="relative">
        {isVip && (
          <div className="absolute -top-3 left-4 z-10 bg-gradient-to-r from-amber-400 to-purple-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            👑 VIP ELAN
          </div>
        )}
        <Gallery images={listing.images} title={listing.title} />
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
          {listing.category && (
            <Link href={\`/?cat=\${listing.category.slug}\`}
              className="inline-block text-xs text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full mt-2 font-medium">
              {listing.category.name}
            </Link>
          )}
        </div>

        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full grid place-items-center font-bold text-lg">
            {listing.seller.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{listing.seller.name}</div>
            <div className="text-xs text-gray-500">
              {listing.city && <>📍 {listing.city} • </>}
              {new Date(listing.createdAt).toLocaleDateString("az-AZ")}
            </div>
          </div>
          {!isOwner && me && <ContactButton sellerId={listing.seller.id} listingId={listing.id} />}
        </div>

        <div className="border-t pt-4">
          {isAuction ? (
            <>
              {isWinner && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-4 text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="font-bold text-green-700 text-lg">Bu auksionu sən qazandın!</div>
                  {listing.seller.phone && (
                    <div className="text-sm text-green-700 mt-2">
                      Əlaqə: <span className="font-bold">{listing.seller.phone}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-500 font-medium">
                {ended ? "Auksion bitdi" : "Cari ən yüksək təklif"}
              </div>
              <div className="text-4xl font-black text-orange-600">
                {Number(topBid ?? listing.price).toFixed(2)} ₼
              </div>
              {listing.auctionEnd && (
                <div className="text-xs text-gray-500 mt-1">
                  Bitmə: {new Date(listing.auctionEnd).toLocaleString("az-AZ")}
                </div>
              )}
              {!ended && !isOwner && <BidBox listingId={listing.id} minBid={Number(topBid ?? listing.price)} loggedIn={!!me} />}
              {isOwner && <p className="text-xs text-gray-500 mt-2">Bu sənin elanındır.</p>}
              {!me && !ended && (
                <p className="text-sm text-gray-500 mt-2">
                  Təklif vermək üçün <Link href="/giris" className="text-orange-600 font-medium">daxil ol</Link>.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="text-4xl font-black text-orange-600">
                {Number(listing.price).toFixed(2)} ₼
              </div>
              {!isOwner && listing.seller.phone && me && (
                <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-700 font-medium">Əlaqə nömrəsi</div>
                    <div className="font-bold text-lg">{listing.seller.phone}</div>
                  </div>
                  <a href={\`tel:\${listing.seller.phone}\`} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
                    📞 Zəng et
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

        {isOwner && (
          <div className="space-y-2">
            <VIPButton
              listingId={listing.id}
              isVip={!!isVip}
              vipUntil={listing.vipUntil?.toISOString()}
              minPrice={Number(listing.category?.vipMinPrice ?? 1)}
              daysLeft={daysLeft}
            />
            <div className="flex gap-2">
              <Link href={\`/elan/\${listing.id}/duzenle\`}
                className="flex-1 text-center bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 rounded-xl font-medium transition-colors">
                ✏️ Redaktə et
              </Link>
            </div>
          </div>
        )}

        {isAuction && listing.bids.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="font-semibold mb-3">Təkliflər ({listing.bids.length})</h2>
            <ul className="text-sm space-y-1 max-h-72 overflow-auto">
              {listing.bids.map((b, i) => (
                <li key={b.id} className={\`flex justify-between py-2 px-3 rounded-lg \${
                  i === 0 ? "bg-gradient-to-r from-orange-50 to-amber-50 font-bold" : "border-b"
                }\`}>
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

// ============ KABINET — WITH ACTIONS ============
files["src/app/kabinet/page.tsx"] = `import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import ListingActions from "./ListingActions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [myListings, myBids] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: user.id },
      orderBy: [{ vipUntil: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, title: true, price: true, type: true, status: true,
        city: true, images: true, auctionEnd: true, condition: true, vipUntil: true,
        category: { select: { id: true, name: true, slug: true } },
        bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
      },
    }),
    prisma.bid.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { id: true, title: true } } },
      take: 30,
    }),
  ]);

  const now = new Date();
  const vipCount = myListings.filter(l => l.vipUntil && l.vipUntil > now).length;
  const activeCount = myListings.filter(l => l.status === "ACTIVE").length;
  const soldCount = myListings.filter(l => l.status === "SOLD").length;

  return (
    <div className="space-y-8 animate-in">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-2xl font-black">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black">{user.name}</div>
            <div className="text-sm text-white/80">{user.email}</div>
          </div>
          <Link href="/elan/yeni" className="bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform">
            + Yeni elan
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <div className="text-2xl font-black">{activeCount}</div>
            <div className="text-[11px] text-white/80">Aktiv</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <div className="text-2xl font-black">{vipCount}</div>
            <div className="text-[11px] text-white/80">👑 VIP</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <div className="text-2xl font-black">{soldCount}</div>
            <div className="text-[11px] text-white/80">Satıldı</div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg">Mənim elanlarım</h2>
          <span className="text-xs text-gray-500">{myListings.length} elan</span>
        </div>
        {myListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500">Hələ elan yoxdur</p>
            <Link href="/elan/yeni" className="inline-block mt-4 text-orange-600 font-medium hover:underline">
              + İlk elanını yarat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {myListings.map((l, i) => (
              <div key={l.id} className="space-y-2">
                <ListingCard l={l} idx={i} />
                <ListingActions id={l.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-black text-lg mb-3">Verdiyim təkliflər</h2>
        {myBids.length === 0 ? (
          <p className="text-gray-500 text-sm">Hələ təklif yoxdur.</p>
        ) : (
          <div className="bg-white border rounded-2xl divide-y overflow-hidden">
            {myBids.map((b) => (
              <Link key={b.id} href={\`/elan/\${b.listingId}\`} className="flex justify-between p-4 hover:bg-gray-50 transition-colors">
                <span className="font-medium text-sm">{b.listing.title}</span>
                <span className="font-bold text-orange-600">{Number(b.amount).toFixed(2)} ₼</span>
              </Link>
            ))}
          </div>
        )}
      </section>
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
console.log("\n✅ " + count + " fayl yenilendi!");
console.log("\n🚀 Sonra:");
console.log("   npx prisma generate");
console.log("   npm run dev");