import { prisma } from "@/lib/prisma";
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
  const vipCount = myListings.filter((l) => l.vipUntil && l.vipUntil > now).length;
  const activeCount = myListings.filter((l) => l.status === "ACTIVE").length;
  const soldCount = myListings.filter((l) => l.status === "SOLD").length;

  return (
    <div className="space-y-8 animate-in">
      {/* Profil kartı */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center text-2xl font-black">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black">{user.name}</div>
            <div className="text-sm text-white/80">{user.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/ayarlar"
              className="bg-white/20 backdrop-blur text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-2 text-sm"
            >
              ⚙️ Ayarlar
            </Link>
            <Link
              href="/elan/yeni"
              className="bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              + Yeni elan
            </Link>
          </div>
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

      {/* Mənim elanlarım */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg">Mənim elanlarım</h2>
          <span className="text-xs text-gray-500">{myListings.length} elan</span>
        </div>
        {myListings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500">Hələ elan yoxdur</p>
            <Link
              href="/elan/yeni"
              className="inline-block mt-4 text-orange-600 font-medium hover:underline"
            >
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

      {/* Təkliflərim */}
      <section>
        <h2 className="font-black text-lg mb-3">Verdiyim təkliflər</h2>
        {myBids.length === 0 ? (
          <p className="text-gray-500 text-sm">Hələ təklif yoxdur.</p>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
            {myBids.map((b) => (
              <Link
                key={b.id}
                href={`/elan/${b.listingId}`}
                className="flex justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-sm">{b.listing.title}</span>
                <span className="font-bold text-orange-600">{Number(b.amount).toFixed(2)} ₼</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}