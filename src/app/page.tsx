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
    createdAt: true,
    category: { select: { id: true, name: true, slug: true } },
    bids: { orderBy: { amount: "desc" } as const, take: 1, select: { amount: true } },
  };

  const [vipListings, regularListings, categories] = await Promise.all([
    prisma.listing.findMany({
      where: { ...where, vipUntil: { gt: now } },
      orderBy: { vipUntil: "desc" },
      take: 4,
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
    (searchParams.minPrice || searchParams.maxPrice) && { k: "Qiymət", v: `${searchParams.minPrice || "0"} - ${searchParams.maxPrice || "∞"} ₼` },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div>
      <FilterBar categories={categories} />

      {/* Kateqoriya chips - yalnız axtarış olmayanda */}
      {!isSearching && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <Link href="/" className="whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-medium bg-gray-900 text-white">
            Hamısı
          </Link>
          <Link href="/?type=AUCTION" className="whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-medium bg-white border border-gray-200 hover:border-gray-400 transition-colors">
            Auksionlar
          </Link>
          {categories.slice(0, 10).map((c) => (
            <Link
              key={c.id}
              href={`/?cat=${c.slug}`}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-medium bg-white border border-gray-200 hover:border-gray-400 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 items-center">
          {activeFilters.map((f, i) => (
            <span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-medium">
              {f.k}: {f.v}
            </span>
          ))}
          <Link href="/" className="text-[11px] text-red-600 hover:underline font-medium ml-1">
            Təmizlə
          </Link>
        </div>
      )}

      {/* VIP bölmə */}
      {vipListings.length > 0 && !isSearching && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-1.5">
              <span className="text-amber-500">★</span> VIP Elanlar
            </h2>
            <Link href="/?type=VIP" className="text-[12px] text-gray-500 hover:text-gray-900">
              Hamısı
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {vipListings.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        </section>
      )}

      {/* Adi elanlar */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[15px] font-bold text-gray-900">
            {isSearching ? "Nəticələr" : "Bütün elanlar"}
          </h2>
          <span className="text-[12px] text-gray-500">
            {regularListings.length} elan
          </span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {regularListings.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>

        {regularListings.length === 0 && vipListings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">Elan tapılmadı</p>
            <p className="text-[13px] text-gray-400 mt-1">Filtrləri dəyişin</p>
            <Link href="/" className="inline-block mt-4 text-orange-600 text-[13px] font-medium hover:underline">
              Filtrləri təmizlə
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}