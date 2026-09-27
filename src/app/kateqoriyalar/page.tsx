import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: true } } },
  });

  return (
    <div className="animate-in">
      <h1 className="text-2xl font-bold mb-6">Bütün Kateqoriyalar</h1>
      {cats.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">Hələ kateqoriya yoxdur.</p>
          <p className="text-sm text-yellow-700 mt-2">
            Terminalda işlət: <code className="bg-yellow-100 px-2 py-1 rounded">node prisma/seed.mjs</code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/?cat=${c.slug}`}
              className="group bg-white border rounded-xl p-5 hover:border-orange-400 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="text-4xl mb-2">{c.emoji}</div>
              <div className="font-semibold text-sm group-hover:text-orange-600 transition-colors">
                {c.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {c._count.listings} elan
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}