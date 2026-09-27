import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/giris");

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true, images: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderId: true, readAt: true } },
    },
  });

  const withUnread = await Promise.all(
    convs.map(async (c) => {
      const unread = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: me.id }, readAt: null },
      });
      return { ...c, unread };
    })
  );

  return (
    <div className="animate-in max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Mesajlar</h1>
      {withUnread.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-6xl mb-3">💬</div>
          <p className="text-gray-500">Hələ mesaj yoxdur.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {withUnread.map((c) => {
            const other = c.userAId === me.id ? c.userB : c.userA;
            const last = c.messages[0];
            return (
              <Link
                key={c.id}
                href={`/mesajlar/${c.id}`}
                className="flex gap-3 bg-white p-3 rounded-xl border hover:border-orange-300 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white grid place-items-center font-bold flex-shrink-0">
                  {other.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold text-sm">{other.name}</div>
                    {last && (
                      <div className="text-[10px] text-gray-400">
                        {new Date(last.createdAt).toLocaleString("az-AZ")}
                      </div>
                    )}
                  </div>
                  {c.listing && (
                    <div className="text-xs text-orange-600 truncate">📦 {c.listing.title}</div>
                  )}
                  <div className="text-sm text-gray-600 truncate">
                    {last ? (last.senderId === me.id ? "Sən: " : "") + last.body : "Mesaj yoxdur"}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div className="bg-orange-600 text-white text-xs rounded-full w-5 h-5 grid place-items-center flex-shrink-0 self-center">
                    {c.unread}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}