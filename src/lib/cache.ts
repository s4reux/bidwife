import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, emoji: true },
    });
  },
  ["categories-top-v1"],
  { revalidate: 300, tags: ["categories"] }
);