export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });

  const { status } = await req.json();
  await prisma.report.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });
  await prisma.report.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}