import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  AUCTION_WON: "🏆",
  AUCTION_ENDED: "🔨",
  NEW_MESSAGE: "💬",
  OUTBID: "⚠️",
  BID_PLACED: "📢",
};

export default async function NotificationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/giris");

  const items = await prisma.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  await prisma.notification.updateMany({
    where: { userId: me.id, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="animate-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Bildirisler</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-6xl mb-3">🔔</div>
          <p className="text-gray-500">Bildiris yoxdur.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              className={`flex gap-3 bg-white p-4 rounded-xl border hover:border-orange-300 transition-all ${
                !n.readAt ? "border-l-4 border-l-orange-500" : ""
              }`}
            >
              <div className="text-2xl">{ICONS[n.type] || "📌"}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{n.title}</div>
                {n.body && <div className="text-sm text-gray-600 mt-0.5">{n.body}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString("az-AZ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}