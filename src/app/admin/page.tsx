import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const now = new Date();
  const [users, listings, bids, messages, activeListings, vipListings, soldListings] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.bid.count(),
    prisma.message.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { vipUntil: { gt: now } } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
  ]);

  const stats = [
    { label: "İstifadəçilər", value: users, emoji: "👥", color: "from-blue-500 to-cyan-500" },
    { label: "Elanlar", value: listings, emoji: "📦", color: "from-orange-500 to-red-500" },
    { label: "Aktiv", value: activeListings, emoji: "✅", color: "from-green-500 to-emerald-500" },
    { label: "VIP", value: vipListings, emoji: "👑", color: "from-amber-400 to-yellow-500" },
    { label: "Satıldı", value: soldListings, emoji: "💰", color: "from-purple-500 to-pink-500" },
    { label: "Təkliflər", value: bids, emoji: "🔨", color: "from-indigo-500 to-blue-500" },
    { label: "Mesajlar", value: messages, emoji: "💬", color: "from-teal-500 to-green-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
          <div className="text-3xl mb-2">{s.emoji}</div>
          <div className="text-3xl font-black">{s.value}</div>
          <div className="text-xs opacity-90 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}