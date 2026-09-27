import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(3).max(3000).optional(),
  price: z.number().positive().optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "USED"]).optional(),
  city: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "ENDED", "SOLD"]).optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id && !user.isAdmin)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: p.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giris teleb olunur" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Tapilmadi" }, { status: 404 });
  if (listing.sellerId !== user.id && !user.isAdmin)
    return NextResponse.json({ error: "Icaze yoxdur" }, { status: 403 });

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}