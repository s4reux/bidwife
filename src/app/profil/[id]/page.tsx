import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      listings: {
        where: {
          OR: [{ status: "ACTIVE" }, { status: "SOLD" }],
        },
        orderBy: [{ vipUntil: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, title: true, price: true, type: true, status: true,
          city: true, images: true, auctionEnd: true, condition: true,
          vipUntil: true, createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
        },
      },
      _count: { select: { listings: true, bids: true } },
    },
  });

  if (!user) notFound();

  const activeListings = user.listings.filter((l) => l.status === "ACTIVE");
  const soldListings = user.listings.filter((l) => l.status === "SOLD");

  return (
    <div className="animate-in">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white mb-6">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/20 backdrop-blur grid place-items-center text-4xl md:text-5xl font-black">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black">{user.name}</h1>
            <p className="text-sm text-white/80 mt-1">
              📅 Qeydiyyat: {new Date(user.createdAt).toLocaleDateString("az-AZ")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{activeListings.length}</div>
            <div className="text-[11px] text-white/80">Aktiv elan</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{soldListings.length}</div>
            <div className="text-[11px] text-white/80">Satıldı</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{user._count.bids}</div>
            <div className="text-[11px] text-white/80">Təkliflər</div>
          </div>
        </div>
      </div>

      {activeListings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            📦 Aktiv elanlar
            <span className="text-sm font-medium text-gray-400">({activeListings.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeListings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
          </div>
        </section>
      )}

      {soldListings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            💰 Satılmış
            <span className="text-sm font-medium text-gray-400">({soldListings.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-75">
            {soldListings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
          </div>
        </section>
      )}

      {activeListings.length === 0 && soldListings.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500">Bu istifadəçinin hələ elanı yoxdur</p>
        </div>
      )}
    </div>
  );
}