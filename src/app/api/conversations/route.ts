import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const { otherUserId, listingId } = await req.json();
  if (!otherUserId || otherUserId === me.id)
    return NextResponse.json({ error: "Yanlis istifadeci" }, { status: 400 });

  const [a, b] = [me.id, otherUserId].sort();

  const existing = await prisma.conversation.findFirst({
    where: { userAId: a, userBId: b, listingId: listingId ?? null },
  });
  if (existing) return NextResponse.json({ id: existing.id });

  const conv = await prisma.conversation.create({
    data: { userAId: a, userBId: b, listingId: listingId ?? null },
  });
  return NextResponse.json({ id: conv.id });
}