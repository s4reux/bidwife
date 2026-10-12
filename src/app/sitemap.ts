import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bidwife-m4yj.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: { slug: true },
  });

  const staticPages = [
    { url: APP_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${APP_URL}/kateqoriyalar`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${APP_URL}/haqqinda`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${APP_URL}/elaqe`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${APP_URL}/terms`, priority: 0.3, changeFrequency: "monthly" as const },
    { url: `${APP_URL}/privacy`, priority: 0.3, changeFrequency: "monthly" as const },
  ];

  const categoryPages = categories.map((c) => ({
    url: `${APP_URL}/?cat=${c.slug}`,
    priority: 0.7,
    changeFrequency: "daily" as const,
  }));

  const listingPages = listings.map((l) => ({
    url: `${APP_URL}/elan/${l.id}`,
    lastModified: l.createdAt,
    priority: 0.6,
    changeFrequency: "weekly" as const,
  }));

  return [
    ...staticPages.map((p) => ({
      url: p.url,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...categoryPages.map((p) => ({
      url: p.url,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...listingPages,
  ];
}