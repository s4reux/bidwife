import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const s = z.object({ listingId: z.string(), amount: z.number().positive() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlis melumat" }, { status: 400 });
  const { listingId, amount } = p.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { bids: { orderBy: { amount: "desc" }, take: 1 } },
  });
  if (!listing || listing.type !== "AUCTION")
    return NextResponse.json({ error: "Auksion tapilmadi" }, { status: 404 });
  if (listing.sellerId === user.id)
    return NextResponse.json({ error: "Oz elanina teklif vere bilmezsen" }, { status: 400 });
  if (listing.auctionEnd && new Date(listing.auctionEnd) < new Date())
    return NextResponse.json({ error: "Auksion bitib" }, { status: 400 });

  const top = listing.bids[0];
  if (amount <= Number(top?.amount ?? listing.price))
    return NextResponse.json({ error: `Teklif ${Number(top?.amount ?? listing.price).toFixed(2)} AZN-den boyuk olmalidir` }, { status: 400 });

  await prisma.bid.create({ data: { listingId, amount, userId: user.id } });

  // Satıcıya bildiriş
  await notify(
    listing.sellerId,
    "BID_PLACED",
    "Yeni teklif!",
    user.name + " — " + listing.title + " (" + amount.toFixed(2) + " AZN)",
    "/elan/" + listingId
  );

  // Əvvəlki ən yüksək təklif sahibinə bildiriş
  if (top && top.userId !== user.id) {
    await notify(
      top.userId,
      "OUTBID",
      "Teklifinizi keçdilər",
      listing.title + " — yeni teklif: " + amount.toFixed(2) + " AZN",
      "/elan/" + listingId
    );
  }

  return NextResponse.json({ ok: true });
}