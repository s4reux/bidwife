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

  let where: any = { status: { in: ["ACTIVE", "SOLD"] } };

  if (searchParams.type === "AUCTION") {
    where.type = "AUCTION";
    where.status = "ACTIVE";
    where.auctionEnd = { gt: now };
  } else if (searchParams.type === "FIXED") {
    where.type = "FIXED";
    where.status = "ACTIVE";
  } else {
    where.OR = [
      { type: "FIXED", status: "ACTIVE" },
      { type: "AUCTION", status: "ACTIVE", auctionEnd: { gt: now } },
    ];
    delete where.status;
  }

  if (searchParams.q) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: searchParams.q, mode: "insensitive" } },
          { description: { contains: searchParams.q, mode: "insensitive" } },
        ],
      },
    ];
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
    views: true, createdAt: true,
    category: { select: { id: true, name: true, slug: true } },
    bids: { orderBy: { amount: "desc" } as const, take: 1, select: { amount: true } },
  };

  const [vipListings, regularListings, categories, totalCount] = await Promise.all([
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
    prisma.listing.count({ where }),
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
      {/* HERO — yalnız axtarış yoxdursa */}
      {!isSearching && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 md:p-14 mb-8">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium mb-5 border border-white/10">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Azərbaycanın onlayn bazarı
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-4">
              Al, sat,
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"> auksion </span>
              et
            </h1>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
              Minlərlə elan, canlı auksionlar, təhlükəsiz alış-veriş. Bir platformada hər şey.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/elan/yeni"
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform text-sm"
              >
                + Elan yerləşdir
              </Link>
              <Link
                href="/?type=AUCTION"
                className="bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Canlı auksionlar
              </Link>
            </div>

            <div className="flex gap-8 mt-8 pt-6 border-t border-white/10">
              <div>
                <div className="text-2xl md:text-3xl font-black">{totalCount.toLocaleString("az-AZ")}</div>
                <div className="text-xs text-gray-400 mt-0.5">Aktiv elan</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black">{vipListings.length}</div>
                <div className="text-xs text-gray-400 mt-0.5">VIP elan</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black">{categories.length}</div>
                <div className="text-xs text-gray-400 mt-0.5">Kateqoriya</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <FilterBar categories={categories} />

      {/* Kateqoriya chips */}
      {!isSearching && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <Link
            href="/"
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-gray-900 text-white"
          >
            Hamısı
          </Link>
          <Link
            href="/?type=AUCTION"
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
          >
            Auksionlar
          </Link>
          {categories.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              href={`/?cat=${c.slug}`}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/kateqoriyalar"
            className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-all"
          >
            Hamısına bax →
          </Link>
        </div>
      )}

      {/* Filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Filtrlər</span>
          {activeFilters.map((f, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium"
            >
              <span className="text-gray-400">{f.k}:</span> {f.v}
            </span>
          ))}
          <Link href="/" className="text-xs text-orange-600 hover:underline ml-1 font-medium">
            Təmizlə
          </Link>
        </div>
      )}

      {/* VIP elanlar */}
      {vipListings.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center">
                <span className="text-lg">👑</span>
              </div>
              <div>
                <h2 className="font-black text-lg leading-tight">VIP Elanlar</h2>
                <p className="text-xs text-gray-400">Önə çıxarılmış elanlar</p>
              </div>
            </div>
            <Link
              href="/?type=VIP"
              className="text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              Hamısı →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vipListings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
          </div>
        </section>
      )}

      {/* Adi elanlar */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-lg leading-tight">
              {isSearching ? "Nəticələr" : "Son elanlar"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {regularListings.length} elan {isSearching && "tapıldı"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {regularListings.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
        </div>

        {regularListings.length === 0 && vipListings.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 grid place-items-center mx-auto mb-5">
              <span className="text-4xl">🔍</span>
            </div>
            <p className="text-gray-900 font-bold text-lg mb-1">Elan tapılmadı</p>
            <p className="text-sm text-gray-500 mb-6">Filtrləri dəyiş və yenidən yoxla</p>
            <Link
              href="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Filtrləri təmizlə
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}