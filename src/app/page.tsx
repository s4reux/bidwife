import { prisma } from "@/lib/prisma";
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
    (searchParams.minPrice || searchParams.maxPrice) && { k: "Qiymət", v: `${searchParams.minPrice || "0"} — ${searchParams.maxPrice || "∞"} ₼` },
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
            <Link key={c.id} href={`/?cat=${c.slug}`}
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
}