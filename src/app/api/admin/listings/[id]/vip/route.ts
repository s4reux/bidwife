import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });

  const { days } = await req.json();
  if (days === 0) {
    await prisma.listing.update({
      where: { id: params.id },
      data: { vipUntil: null },
    });
  } else {
    const until = new Date(Date.now() + Number(days) * 86400000);
    await prisma.listing.update({
      where: { id: params.id },
      data: { vipUntil: until },
    });
  }
  return NextResponse.json({ ok: true });
}