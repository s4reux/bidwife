"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav({
  loggedIn,
  unreadMsgs,
}: {
  loggedIn: boolean;
  unreadMsgs: number;
}) {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    if (!loggedIn) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavCount(d.ids?.length || 0))
      .catch(() => {});
  }, [loggedIn, pathname]);

  if (pathname?.startsWith("/mesajlar/")) return null;
  if (pathname?.match(/^\/elan\/[^/]+$/) && !pathname?.endsWith("/yeni")) return null;
  if (pathname?.endsWith("/duzenle")) return null;

  const items = [
    {
      href: "/",
      label: "Əsas",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: "/favoriler",
      label: "Seçilmiş",
      badge: favCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
    },
    {
      href: "/elan/yeni",
      label: "Yeni elan",
      big: true,
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      href: "/mesajlar",
      label: "Mesajlar",
      badge: unreadMsgs,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      href: "/kabinet",
      label: "Kabinet",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 relative max-w-lg mx-auto">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

          if (item.big) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 grid place-items-center shadow-lg shadow-orange-500/30 active:scale-95 transition-transform text-white">
                  {item.icon}
                </div>
                <span className="text-[10px] text-gray-700 mt-1 font-medium">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <div className="relative">
                <span className={active ? "text-orange-600" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] leading-none ${
                  active ? "text-orange-600 font-bold" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}