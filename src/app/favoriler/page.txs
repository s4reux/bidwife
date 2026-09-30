import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
          bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
        },
      },
    },
  });

  const items = favorites.map((f) => f.listing);

  return (
    <div className="animate-in">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
        <span className="text-red-500">❤️</span> Favorilər
        <span className="text-sm text-gray-400 font-medium">({items.length})</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-gray-500 font-bold text-lg">Hələ favori yoxdur</p>
          <p className="text-sm text-gray-400 mt-1">
            Bəyəndiyin elanların ürək işarəsinə bas
          </p>
          <Link
            href="/"
            className="inline-block mt-5 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-700 transition-colors"
          >
            Elanlara bax
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((l, i) => <ListingCard key={l.id} l={l} idx={i} />)}
        </div>
      )}
    </div>
  );
}