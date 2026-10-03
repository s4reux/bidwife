export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(30).optional().nullable(),
});

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlış məlumat" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { name: p.data.name, phone: p.data.phone || null },
  });

  return NextResponse.json({ ok: true });
}