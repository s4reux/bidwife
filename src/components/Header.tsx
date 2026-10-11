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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-2.5">
        <Link href="/" className="shrink-0">
          <span className="font-black text-xl tracking-tight">
            <span className="text-orange-600">Bid</span>
            <span className="text-gray-900">Wife</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-0.5 text-[13px]">
          <Link href="/" className="px-2.5 py-1.5 text-gray-700 hover:text-orange-600 transition-colors">
            Elanlar
          </Link>
          <Link href="/kateqoriyalar" className="px-2.5 py-1.5 text-gray-700 hover:text-orange-600 transition-colors">
            Kateqoriyalar
          </Link>
          <Link href="/?type=AUCTION" className="px-2.5 py-1.5 text-gray-700 hover:text-orange-600 transition-colors">
            Auksionlar
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 text-sm">
          <Link
            href="/elan/yeni"
            className="bg-orange-600 text-white px-3.5 py-1.5 rounded-md hover:bg-orange-700 transition-colors font-medium text-[13px]"
          >
            + Elan ver
          </Link>

          {user ? (
            <>
              <Link href="/mesajlar" className="relative p-2 hover:bg-gray-100 rounded-md transition-colors">
                <span className="text-base">💬</span>
                {unreadMsgs > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5 font-bold">
                    {unreadMsgs > 9 ? "9+" : unreadMsgs}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link href="/kabinet" className="flex items-center gap-1.5 p-1 hover:bg-gray-100 rounded-md transition-colors">
                <div className="w-7 h-7 rounded-full bg-orange-600 text-white grid place-items-center font-bold text-[11px]">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-[13px] font-medium hidden md:inline text-gray-700">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/giris" className="px-3 py-1.5 text-[13px] text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Giriş
              </Link>
              <Link href="/qeydiyyat" className="bg-gray-900 text-white px-3.5 py-1.5 rounded-md hover:bg-gray-800 transition-colors font-medium text-[13px]">
                Qeydiyyat
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}