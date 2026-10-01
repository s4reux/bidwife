export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  await prisma.verifyCode.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verifyCode.create({
    data: { userId: user.id, code, expiresAt },
  });

  try {
    await sendVerificationEmail(user.email, user.name, code);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Email göndərilə bilmədi" }, { status: 500 });
  }
}