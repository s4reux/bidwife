import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const s = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Email yanlışdır" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: p.data.email } });

  // Təhlükəsizlik: user yoxdursa da "uğurlu" qaytar
  if (!user) {
    return NextResponse.json({
      ok: true,
      message: "Əgər bu email qeydiyyatdadırsa, link göndərildi",
    });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const resetUrl = `${baseUrl}/sifre-sifirla/${token}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
    console.log("✅ Email göndərildi:", user.email);
  } catch (e: any) {
    console.error("❌ Email xətası:", e.message);
    return NextResponse.json({
      error: "Email göndərilə bilmədi. Yenidən cəhd edin.",
    }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Email göndərildi. Gelen qutusunu yoxlayın.",
  });
}