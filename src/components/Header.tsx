import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import NotificationBell from "./NotificationBell";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const user = await getCurrentUser();
  let unreadMsgs = 0;
  if (user) {
    unreadMsgs = await prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: { OR: [{ userAId: user.id }, { userBId: user.id }] },
      },
    });
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-black text-2xl group-hover:scale-105 transition-transform">
            <span className="text-orange-600">Bid</span>
            <span className="text-gray-900">Wife</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-1 text-sm">
          <Link href="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">Hamısı</Link>
          <Link href="/kateqoriyalar" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">Kateqoriyalar</Link>
          <Link href="/?type=AUCTION" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">🔴 Auksionlar</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 text-sm">
          <Link
            href="/elan/yeni"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium flex items-center gap-1.5 text-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Elan ver</span>
          </Link>

          {user ? (
            <>
              <Link href="/mesajlar" className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <span className="text-lg">💬</span>
                {unreadMsgs > 0 && (
                  <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">
                    {unreadMsgs > 9 ? "9+" : unreadMsgs}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link href="/kabinet" className="hidden sm:flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white grid place-items-center font-bold text-sm">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
              </Link>
              <form action="/api/auth/logout" method="POST" className="hidden sm:block">
                <button className="text-gray-400 hover:text-red-600 transition-colors p-2" title="Çıxış">
                  ⏻
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/giris" className="px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium">Giriş</Link>
              <Link href="/qeydiyyat" className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors font-medium">Qeydiyyat</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}