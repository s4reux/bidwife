import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import BidBox from "@/components/BidBox";
import Link from "next/link";
import ContactButton from "./ContactButton";
import Gallery from "./Gallery";
import VIPButton from "./VIPButton";
import BidLive from "./BidLive";

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
      category: { select: { name: true, slug: true, vipMinPrice: true } },
      bids: {
        orderBy: { amount: "desc" },
        take: 30,
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
    <div className="animate-in max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Link href="/" className="hover:text-orange-600 transition-colors">Ana səhifə</Link>
        {listing.category && (
          <>
            <span>›</span>
            <Link href={`/?cat=${listing.category.slug}`} className="hover:text-orange-600 transition-colors">
              {listing.category.name}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-700 truncate">{listing.title}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          <div className="lg:hidden">
            <h1 className="text-xl font-bold leading-tight">{listing.title}</h1>
          </div>

          <Gallery images={listing.images} title={listing.title} />

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100">
            <h2 className="font-bold text-lg mb-3">Təsvir</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
              {listing.description}
            </p>

            <div className="mt-5 pt-5 border-t grid grid-cols-2 gap-4 text-sm">
              {listing.condition && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Vəziyyət</div>
                  <div className="font-medium">{CONDITION_LABEL[listing.condition]}</div>
                </div>
              )}
              {listing.city && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Şəhər</div>
                  <div className="font-medium">📍 {listing.city}</div>
                </div>
              )}
              {listing.category && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Kateqoriya</div>
                  <div className="font-medium">{listing.category.name}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Yerləşdirildi</div>
                <div className="font-medium">
                  {new Date(listing.createdAt).toLocaleDateString("az-AZ")}
                </div>
              </div>
            </div>
          </div>

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
            </div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h1 className="hidden lg:block text-xl font-bold leading-tight mb-3">
                {listing.title}
              </h1>

              {isVip && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black px-3 py-1 rounded-full mb-3 shadow-sm">
                  👑 VIP ELAN
                </div>
              )}
            </div>

            {isAuction ? (
              <>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide flex items-center gap-2">
                  {ended ? "Auksion bitdi" : "Cari təklif"}
                  {!ended && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </div>
                <div className="text-3xl font-black text-orange-600 mb-1">
                  {Number(topBid ?? listing.price).toFixed(2)} ₼
                </div>
                {listing.auctionEnd && !ended && (
                  <div className="text-xs text-gray-500 mb-3">
                    ⏱ Bitmə: {new Date(listing.auctionEnd).toLocaleString("az-AZ")}
                  </div>
                )}
                {ended && (
                  <div className="text-xs text-gray-500 mb-3">Bu auksion artıq bitib</div>
                )}

                {isWinner && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 mb-3 text-center">
                    <div className="text-3xl">🏆</div>
                    <div className="font-bold text-green-700 mt-1">Sən qazandın!</div>
                    {listing.seller.phone && (
                      <a
                        href={`tel:${listing.seller.phone}`}
                        className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        📞 {listing.seller.phone}
                      </a>
                    )}
                  </div>
                )}

                {!ended && !isOwner && (
                  <BidBox listingId={listing.id} minBid={Number(topBid ?? listing.price)} loggedIn={!!me} />
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
                <div className="text-3xl font-black text-orange-600 mb-4">
                  {Number(listing.price).toFixed(2)} ₼
                </div>

                            {!isOwner && listing.seller.phone && me && (
                  <a
                    href={`tel:${listing.seller.phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 transition-all mb-2"
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
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 transition-all"
                  >
                    📞 Əlaqə üçün daxil ol
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white grid place-items-center font-bold text-lg">
                {listing.seller.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">Satıcı</div>
                <div className="font-semibold truncate">{listing.seller.name}</div>
              </div>
            </div>

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


                          {!ended && !isOwner && (
                  <BidBox listingId={listing.id} minBid={Number(topBid ?? listing.price)} loggedIn={!!me} />
                )}

                {!ended && !isOwner && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800 leading-relaxed">
                    ⚠️ <b>Diqqət:</b> Satıcının əlaqə məlumatları <b>yalnız auksionu qazanan</b> şəxslə paylaşılacaq. Təklif ver, qazan, sonra satıcı ilə əlaqə saxla.
                  </div>
                )}

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
                className="block text-center bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-medium transition-colors text-sm"
              >
                ✏️ Redaktə et
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}