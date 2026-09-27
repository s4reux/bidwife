import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      bids: {
        orderBy: { amount: "desc" },
        take: 30,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!listing) return NextResponse.json({ error: "Tapılmadı" }, { status: 404 });

  const top = listing.bids[0]?.amount ?? listing.price;

  return NextResponse.json({
    top: Number(top),
    bids: listing.bids.map((b) => ({
      id: b.id,
      amount: Number(b.amount),
      userName: b.user.name,
      createdAt: b.createdAt.toISOString(),
    })),
  });
}