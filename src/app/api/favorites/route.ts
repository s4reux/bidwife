export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [], ids: [] });

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

  return NextResponse.json({
    items: favorites.map((f) => f.listing),
    ids: favorites.map((f) => f.listingId),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "ID yoxdur" }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({
      data: { userId: user.id, listingId },
    });
    return NextResponse.json({ favorited: true });
  }
}