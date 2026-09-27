import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const s = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(3).max(3000),
  price: z.number().positive(),
  type: z.enum(["FIXED", "AUCTION"]),
  condition: z.enum(["NEW", "LIKE_NEW", "USED"]).default("USED"),
  city: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  auctionEnd: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", ...(type ? { type: type as any } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş tələb olunur" }, { status: 401 });

  const p = s.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });
  const d = p.data;

  const listing = await prisma.listing.create({
    data: {
      title: d.title,
      description: d.description,
      price: d.price,
      type: d.type,
      condition: d.condition,
      city: d.city ?? null,
      images: d.images,
      auctionEnd: d.auctionEnd ? new Date(d.auctionEnd) : null,
      categoryId: d.categoryId ?? null,
      sellerId: user.id,
    },
  });
  return NextResponse.json({ id: listing.id });
}