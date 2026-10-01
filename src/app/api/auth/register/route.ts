export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendVerificationEmail } from "@/lib/email";

const s = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Məlumat yanlışdır" }, { status: 400 });
  const { name, email, phone, password } = p.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Bu email artıq qeydiyyatdadır" }, { status: 400 });

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: await hashPassword(password) },
  });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verifyCode.create({
    data: { userId: user.id, code, expiresAt },
  });

  try {
    await sendVerificationEmail(user.email, user.name, code);
  } catch (e: any) {
    console.error("Email xətası:", e.message);
  }

  const token = await signToken({ uid: user.id, email: user.email });
  cookies().set("token", token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, needVerify: true });
}