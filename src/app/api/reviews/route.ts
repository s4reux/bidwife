export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  listingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Məlumat yanlışdır" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: p.data.listingId },
    select: { sellerId: true },
  });
  if (!listing) return NextResponse.json({ error: "Elan tapılmadı" }, { status: 404 });

  if (listing.sellerId === user.id)
    return NextResponse.json({ error: "Özünə rəy verə bilməzsən" }, { status: 400 });

  const existing = await prisma.review.findUnique({
    where: { listingId_reviewerId: { listingId: p.data.listingId, reviewerId: user.id } },
  });
  if (existing)
    return NextResponse.json({ error: "Artıq rəy vermisən" }, { status: 400 });

  await prisma.review.create({
    data: {
      listingId: p.data.listingId,
      reviewerId: user.id,
      sellerId: listing.sellerId,
      rating: p.data.rating,
      comment: p.data.comment || null,
    },
  });

  return NextResponse.json({ ok: true });
}