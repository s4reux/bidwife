import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import BidBox from "@/components/BidBox";
import Link from "next/link";
import ContactButton from "./ContactButton";
import Gallery from "./Gallery";
import VIPButton from "./VIPButton";
import BidLive from "./BidLive";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

const CONDITION_LABEL: Record<string, string> = {
  NEW: "🆕 Yeni",
  LIKE_NEW: "✨ Yeni kimi",
  USED: "📦 İşlənmiş",
};

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, name: true, phone: true, email: true } },
      category: { select: { id: true, name: true, slug: true, vipMinPrice: true } },
      bids: {
        orderBy: { amount: "desc" },
        take: 30,
        select: { id: true, amount: true, createdAt: true, user: { select: { name: true } } },
      },
    },
  });
  if (!listing) notFound();

  // Bənzər elanlar — eyni kateqoriya, özü olmayan, aktiv
  const similar = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: "ACTIVE",
      ...(listing.categoryId ? { categoryId: listing.categoryId } : {}),
    },
    orderBy: [{ vipUntil: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: {
      id: true, title: true, price: true, type: true, status: true,
      city: true, images: true, auctionEnd: true, condition: true,
      vipUntil: true, createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
      bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
    },
  });

  const me = await getCurrentUser();
  const topBid = listing.bids[0]?.amount ?? null;
  const isAuction = listing.type === "AUCTION";
  const ended = listing.auctionEnd ? new Date(listing.auctionEnd) < new Date() : false;
  const isOwner = me?.id === listing.sellerId;
  const isWinner = listing.winnerId === me?.id;
  const isVip = listing.vipUntil && listing.vipUntil > new Date();
  const daysLeft = isVip ? Math.ceil((listing.vipUntil!.getTime() - Date.now()) / 86400000) : 0;
  const displayPrice = Number(topBid ?? listing.price).toFixed(2);

  return (
    <div className="animate-in max-w-6xl mx-auto pb-20 lg:pb-0">
      {/* Breadcrumb (desktop) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link href="/" className="hover:text-orange-600">Ana səhifə</Link>
        {listing.category && (
          <>
            <span>›</span>
            <Link href={`/?cat=${listing.category.slug}`} className="hover:text-orange-600">
              {listing.category.name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-700 truncate">{listing.title}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* SOL */}
        <div className="space-y-4">
          <Gallery images={listing.images} title={listing.title} />

          {/* MOBİL: Başlıq + Qiymət */}
          <div className="lg:hidden bg-white rounded-2xl p-5 border border-gray-100">
            {isVip && (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black px-3 py-1 rounded-full mb-3">
                👑 VIP ELAN
              </div>
            )}
            <h1 className="text-xl font-bold leading-tight">{listing.title}</h1>

            <div className="mt-3">
              {isAuction ? (
                <>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-2">
                    {ended ? "Auksion bitdi" : "Cari təklif"}
                    {!ended && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  </div>
                  <div className="text-3xl font-black text-orange-600">{displayPrice} ₼</div>
                </>
              ) : (
                <div className="text-3xl font-black text-orange-600">{displayPrice} ₼</div>
              )}
            </div>
          </div>

          {/* Xüsusiyyətlər */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {listing.city && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Şəhər</div>
                  <div className="font-medium">📍 {listing.city}</div>
                </div>
              )}
              {listing.condition && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Vəziyyət</div>
                  <div className="font-medium">{CONDITION_LABEL[listing.condition]}</div>
                </div>
              )}
              {listing.category && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Kateqoriya</div>
                  <Link href={`/?cat=${listing.category.slug}`} className="font-medium hover:text-orange-600">
                    {listing.category.name}
                  </Link>
                </div>
              )}
              {listing.auctionEnd && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Bitmə vaxtı</div>
                  <div className="font-medium">
                    {new Date(listing.auctionEnd).toLocaleString("az-AZ")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Təsvir */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100">
            <h2 className="font-bold text-lg mb-3">Təsvir</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
              {listing.description}
            </p>
          </div>

          {/* Satıcı kartı */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <Link href={`/profil/${listing.seller.id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white grid place-items-center font-bold text-lg group-hover:scale-105 transition-transform">
                {listing.seller.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">Satıcı</div>
                <div className="font-semibold truncate group-hover:text-orange-600 transition-colors">
                  {listing.seller.name}
                </div>
                <div className="text-[11px] text-orange-600 mt-0.5 opacity-0 group-hover:opacity-100">
                  Bütün elanlarına bax →
                </div>
              </div>
            </Link>

            {!isOwner && me && listing.seller.phone && (
              <>
                {isAuction ? (
                  isWinner ? (
                    <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
                      <div className="text-[10px] text-green-700 uppercase tracking-wide font-bold">Telefon</div>
                      <a href={`tel:${listing.seller.phone}`} className="font-bold text-green-800 hover:underline">
                        {listing.seller.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
                      🔒 Əlaqə məlumatları yalnız auksion qalibinə göstərilir
                    </div>
                  )
                ) : (
                  <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
                    <div className="text-[10px] text-green-700 uppercase tracking-wide font-bold">Telefon</div>
                    <a href={`tel:${listing.seller.phone}`} className="font-bold text-green-800 hover:underline">
                      {listing.seller.phone}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* AUKSİON: Təkliflər + Bid Box — YALNIZ BİR DƏFƏ */}
          {isAuction && (
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                Təkliflər
                {!ended && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                {!ended && <span className="text-xs text-red-500 font-medium">CANLI</span>}
              </h2>

              <BidLive
                listingId={listing.id}
                initialBids={listing.bids.map((b) => ({
                  id: b.id,
                  amount: Number(b.amount),
                  userName: b.user.name,
                  createdAt: b.createdAt.toISOString(),
                }))}
                initialTop={Number(listing.bids[0]?.amount ?? listing.price)}
              />

              {/* Qiymət təklif barı — yalnız auksion üçün */}
              {!ended && !isOwner && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Sizin təklifiniz:
                  </div>
                  <BidBox
                    listingId={listing.id}
                    minBid={Number(topBid ?? listing.price)}
                    loggedIn={!!me}
                  />
                </div>
              )}

              {isWinner && (
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 text-center">
                  <div className="text-3xl">🏆</div>
                  <div className="font-bold text-green-700 mt-1">Sən qazandın!</div>
                  {listing.seller.phone && (
                    <a
                      href={`tel:${listing.seller.phone}`}
                      className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl font-bold"
                    >
                      📞 {listing.seller.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BƏNZƏR ELANLAR */}
          {similar.length > 0 && (
            <section className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg">Bənzər elanlar</h2>
                <Link
                  href={listing.category ? `/?cat=${listing.category.slug}` : "/"}
                  className="text-sm text-orange-600 hover:underline font-medium"
                >
                  Hamısı
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {similar.map((s, i) => <ListingCard key={s.id} l={s} idx={i} />)}
              </div>
            </section>
          )}
        </div>

        {/* SAĞ (desktop) — sticky */}
        <div className="hidden lg:block space-y-4 sticky top-24 self-start">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h1 className="text-xl font-bold leading-tight mb-3">{listing.title}</h1>
            {isVip && (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black px-3 py-1 rounded-full mb-3 shadow-sm">
                👑 VIP ELAN
              </div>
            )}

            {isAuction ? (
              <>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-2">
                  {ended ? "Auksion bitdi" : "Cari təklif"}
                  {!ended && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </div>
                <div className="text-3xl font-black text-orange-600 mb-1">{displayPrice} ₼</div>
                {listing.auctionEnd && !ended && (
                  <div className="text-xs text-gray-500 mb-3">
                    ⏱ Bitmə: {new Date(listing.auctionEnd).toLocaleString("az-AZ")}
                  </div>
                )}
                {ended && <div className="text-xs text-gray-500 mb-3">Bu auksion artıq bitib</div>}

                {isWinner && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 mb-3 text-center">
                    <div className="text-2xl">🏆</div>
                    <div className="font-bold text-green-700 text-sm mt-1">Sən qazandın!</div>
                    {listing.seller.phone && (
                      <a
                        href={`tel:${listing.seller.phone}`}
                        className="mt-2 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
                      >
                        📞 {listing.seller.phone}
                      </a>
                    )}
                  </div>
                )}

                {!ended && !isOwner && (
                  <BidBox
                    listingId={listing.id}
                    minBid={Number(topBid ?? listing.price)}
                    loggedIn={!!me}
                  />
                )}
                {isOwner && (
                  <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-xl font-medium text-center">
                    Bu sənin elanındır
                  </div>
                )}
                {!me && !ended && (
                  <Link
                    href="/giris"
                    className="block text-center bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                  >
                    Təklif vermək üçün daxil ol
                  </Link>
                )}
              </>
            ) : (
              <>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Qiymət</div>
                <div className="text-3xl font-black text-orange-600 mb-4">{displayPrice} ₼</div>

                {!isOwner && listing.seller.phone && me && (
                  <a
                    href={`tel:${listing.seller.phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all mb-2"
                  >
                    📞 {listing.seller.phone}
                  </a>
                )}
                {!isOwner && me && (
                  <ContactButton sellerId={listing.seller.id} listingId={listing.id} fullWidth />
                )}
                {!me && (
                  <Link
                    href="/giris"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold transition-all"
                  >
                    📞 Əlaqə üçün daxil ol
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Owner: idarəetmə */}
          {isOwner && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
              <h3 className="font-bold text-sm text-gray-700">İdarəetmə</h3>
              <VIPButton
                listingId={listing.id}
                isVip={!!isVip}
                vipUntil={listing.vipUntil?.toISOString()}
                minPrice={Number(listing.category?.vipMinPrice ?? 1)}
                daysLeft={daysLeft}
              />
              <Link
                href={`/elan/${listing.id}/duzenle`}
                className="block text-center bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-medium"
              >
                ✏️ Redaktə et
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBİL: Sticky bottom bar */}
      {!isOwner && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-lg">
          <div className="flex gap-2">
            {listing.seller.phone && me ? (
              <a
                href={`tel:${listing.seller.phone}`}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold text-center"
              >
                📞 Zəng et
              </a>
            ) : (
              <Link
                href="/giris"
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold text-center"
              >
                📞 Zəng et
              </Link>
            )}
            {me ? (
              <ContactButton sellerId={listing.seller.id} listingId={listing.id} fullWidth />
            ) : (
              <Link
                href="/giris"
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold text-center"
              >
                💬 Mesaj yaz
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}