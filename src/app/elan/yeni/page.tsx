import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import NewListingForm from "./form";

export default async function NewListing() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, emoji: true },
  });
  return <NewListingForm categories={categories} />;
}