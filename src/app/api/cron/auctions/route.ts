import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export async function GET() {
  const now = new Date();
  const ended = await prisma.listing.findMany({
    where: { type: "AUCTION", status: "ACTIVE", auctionEnd: { lt: now } },
    include: { bids: { orderBy: { amount: "desc" }, take: 1, include: { user: true } } },
  });

  for (const l of ended) {
    const winner = l.bids[0]?.user;
    const amount = l.bids[0]?.amount;

    await prisma.listing.update({
      where: { id: l.id },
      data: { status: winner ? "SOLD" : "ENDED", winnerId: winner?.id ?? null },
    });

    if (winner) {
      await notify(
        winner.id,
        "AUCTION_WON",
        "🎉 Auksionu qazandin!",
        l.title + " — " + Number(amount).toFixed(2) + " AZN",
        "/elan/" + l.id
      );
    }
    await notify(
      l.sellerId,
      "AUCTION_ENDED",
      "Auksion bitdi",
      winner ? l.title + " — qalib: " + winner.name : l.title + " — teklif olmadi",
      "/elan/" + l.id
    );
  }

  return NextResponse.json({ processed: ended.length });
}