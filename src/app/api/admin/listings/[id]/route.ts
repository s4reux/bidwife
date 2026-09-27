import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });
  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}