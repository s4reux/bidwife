export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  listingId: z.string(),
  reason: z.string().min(2).max(100),
  comment: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Məlumat yanlışdır" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: p.data.listingId },
  });
  if (!listing) return NextResponse.json({ error: "Elan tapılmadı" }, { status: 404 });

  if (listing.sellerId === user.id)
    return NextResponse.json({ error: "Öz elanını şikayət edə bilməzsən" }, { status: 400 });

  const existing = await prisma.report.findFirst({
    where: { listingId: p.data.listingId, reporterId: user.id, status: "PENDING" },
  });
  if (existing)
    return NextResponse.json({ error: "Artıq şikayət etmisən" }, { status: 400 });

  await prisma.report.create({
    data: {
      listingId: p.data.listingId,
      reporterId: user.id,
      reason: p.data.reason,
      comment: p.data.comment || null,
    },
  });

  return NextResponse.json({ ok: true });
}