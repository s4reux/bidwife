import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const s = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Yanlis melumat" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!user || !(await verifyPassword(p.data.password, user.password)))
    return NextResponse.json({ error: "Email ve ya sifre yanlisdir" }, { status: 401 });

  const token = await signToken({ uid: user.id, email: user.email });
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}