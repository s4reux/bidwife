import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const s = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Şifrə min 6 simvol" }, { status: 400 });

  const reset = await prisma.passwordReset.findUnique({
    where: { token: p.data.token },
    include: { user: true },
  });

  if (!reset) return NextResponse.json({ error: "Link yanlışdır" }, { status: 400 });
  if (reset.usedAt) return NextResponse.json({ error: "Bu link artıq istifadə olunub" }, { status: 400 });
  if (reset.expiresAt < new Date()) return NextResponse.json({ error: "Link vaxtı bitib" }, { status: 400 });

  await prisma.user.update({
    where: { id: reset.userId },
    data: { password: await hashPassword(p.data.password) },
  });

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}