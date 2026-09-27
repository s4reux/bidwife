import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { amount } = await req.json();
  if (typeof amount !== "number" || amount <= 0)
    return NextResponse.json({ error: "Yanlis mebleg" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  const minPrice = Number(listing.category?.vipMinPrice ?? 1);
  if (amount < minPrice)
    return NextResponse.json({ error: `Minimum ${minPrice} AZN` }, { status: 400 });

  const days = Math.floor(amount);
  const base = listing.vipUntil && listing.vipUntil > new Date() ? listing.vipUntil : new Date();
  const newVipUntil = new Date(base.getTime() + days * 86400000);

  await prisma.listing.update({
    where: { id: params.id },
    data: {
      vipUntil: newVipUntil,
      vipPaid: { increment: amount },
    },
  });

  await notify(
    user.id, "VIP_ACTIVATED", "👑 VIP aktiv edildi",
    `${listing.title} — ${days} gun`,
    "/elan/" + params.id
  );

  return NextResponse.json({ days, until: newVipUntil });
}