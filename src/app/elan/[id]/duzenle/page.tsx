import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import EditForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [listing, categories] = await Promise.all([
    prisma.listing.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, emoji: true, parentId: true },
    }),
  ]);

  if (!listing) notFound();
  if (listing.sellerId !== user.id && !user.isAdmin) redirect("/");

  return <EditForm listing={{
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price),
    condition: listing.condition,
    city: listing.city,
    images: listing.images,
    categoryId: listing.categoryId,
    type: listing.type,
  }} categories={categories} />;
}