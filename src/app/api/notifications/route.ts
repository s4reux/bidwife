export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [], unread: 0 });

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  // 🔑 AUCTION_WON bildirişləri üçün satıcı telefonunu əlavə et
  const itemsWithPhone = await Promise.all(
    items.map(async (n) => {
      if (n.type === "AUCTION_WON" && n.link?.startsWith("/elan/")) {
        try {
          const listingId = n.link.replace("/elan/", "");
          const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { seller: { select: { phone: true } } },
          });
          return { ...n, sellerPhone: listing?.seller.phone || null };
        } catch {
          return n;
        }
      }
      return n;
    })
  );

  return NextResponse.json({ items: itemsWithPhone, unread });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const { ids, all } = await req.json();
  if (all) {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (Array.isArray(ids) && ids.length) {
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { readAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}