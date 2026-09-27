import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });

  const { isAdmin } = await req.json();
  await prisma.user.update({
    where: { id: params.id },
    data: { isAdmin: !!isAdmin },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });
  if (user.id === params.id) return NextResponse.json({ error: "Özünü silə bilməzsən" }, { status: 400 });

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}