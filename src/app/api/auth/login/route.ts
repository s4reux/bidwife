export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const s = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlış məlumat" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: p.data.email } });

  if (!user || !user.password) {
    return NextResponse.json(
      { error: "Email və ya şifrə yanlışdır. Google ilə daxil olun." },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(p.data.password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Email və ya şifrə yanlışdır" }, { status: 401 });
  }

  const token = await signToken({ uid: user.id, email: user.email });
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}