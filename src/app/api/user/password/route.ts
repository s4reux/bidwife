export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth";

const s = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yeni şifrə min 6 simvol" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "İstifadəçi tapılmadı" }, { status: 404 });

  const valid = await verifyPassword(p.data.currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Cari şifrə yanlışdır" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(p.data.newPassword) },
  });

  return NextResponse.json({ ok: true });
}