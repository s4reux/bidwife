import { prisma } from "@/lib/prisma";
import AdminUserRow from "./Row";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { listings: true, bids: true } } },
  });

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="text-left p-3">İstifadəçi</th>
            <th className="text-left p-3 hidden md:table-cell">Email</th>
            <th className="text-left p-3 hidden md:table-cell">Telefon</th>
            <th className="text-left p-3 hidden lg:table-cell">Stat</th>
            <th className="text-right p-3">Əməliyyat</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <AdminUserRow key={u.id} user={{
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              isAdmin: u.isAdmin,
              createdAt: u.createdAt.toISOString(),
              listingCount: u._count.listings,
              bidCount: u._count.bids,
            }} />
          ))}
        </tbody>
      </table>
    </div>
  );
}