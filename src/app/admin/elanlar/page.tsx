import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminListingRow from "./row";

export const dynamic = "force-dynamic";

export default async function AdminListings() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      seller: { select: { id: true, name: true, email: true } },
      category: { select: { name: true } },
      _count: { select: { bids: true } },
    },
  });

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="text-left p-3">Elan</th>
            <th className="text-left p-3 hidden md:table-cell">Satıcı</th>
            <th className="text-left p-3 hidden md:table-cell">Qiymət</th>
            <th className="text-left p-3 hidden lg:table-cell">Status</th>
            <th className="text-right p-3">Əməliyyat</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <AdminListingRow key={l.id} listing={{
              id: l.id,
              title: l.title,
              price: Number(l.price),
              type: l.type,
              status: l.status,
              sellerName: l.seller.name,
              sellerEmail: l.seller.email,
              categoryName: l.category?.name || "—",
              vipUntil: l.vipUntil?.toISOString() || null,
              bidCount: l._count.bids,
            }} />
          ))}
        </tbody>
      </table>
      {listings.length === 0 && (
        <div className="p-10 text-center text-gray-500">Elan yoxdur</div>
      )}
    </div>
  );
}