import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

const s = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Melumat yanlisdir" }, { status: 400 });
  const { name, email, phone, password } = p.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Bu email artiq qeydiyyatdadir" }, { status: 400 });

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: await hashPassword(password) },
  });
  const token = await signToken({ uid: user.id, email: user.email });
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}