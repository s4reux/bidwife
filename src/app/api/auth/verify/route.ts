export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Kod daxil edin" }, { status: 400 });

  const record = await prisma.verifyCode.findFirst({
    where: {
      userId: user.id,
      code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record)
    return NextResponse.json({ error: "Kod yanlışdır və ya vaxtı bitib" }, { status: 400 });

  await prisma.$transaction([
    prisma.verifyCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}